import { State } from "./frame-state.js";
import { GameCanvas } from "game-canvas.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { System, SystemContext } from "game-lib/types/system.js";
import { GameTemplate } from "game-template.js";
import { EngineDebugger } from "engine-debug.js";
import { ActionsAPI } from "game-api/actions-api.js";
import { EngineInput } from "engine-input.js";
import { Rollback } from "rollback.js";
import { EntitiesAPI } from "game-api/entities-api.js";
import { Network, NetworkAction } from "network.js";
import { MetaAPI } from "game-api/meta-api.js";

export class Engine {
    readonly TARGET_UPS = 60;
    readonly MS_PER_FRAME = 1000 / this.TARGET_UPS;
    readonly MAX_CATCHUP_FRAMES = 100;

    currentState: State = new State(this.gameTemplate);
    systems: System[] = [];

    previousUpdateTime = performance.now();
    updateLag = 0;

    debugger: EngineDebugger;
    inputs: EngineInput;
    network: Network;
    rollback: Rollback;
    actionsAPI: ActionsAPI;
    entitiesAPI: EntitiesAPI;
    metaAPI: MetaAPI;

    gameCanvas;

    constructor(
        public name: string,
        public gameTemplate: GameTemplate,
        canvasContainer: HTMLElement
    ) {
        this.gameCanvas = new GameCanvas(canvasContainer);
        this.debugger = new EngineDebugger(this);
        this.inputs = new EngineInput(this.gameCanvas.canvas);
        this.network = new Network(this);
        this.rollback = new Rollback(this);
        this.actionsAPI = new ActionsAPI(this.network, this.currentState);
        this.entitiesAPI = new EntitiesAPI();
        this.metaAPI = new MetaAPI(this);
        this.reloadGameTemplate();
    }

    /**
     * Reload systems from network
     */
    public reloadGameTemplate() {
        this.systems = this.gameTemplate.systems.slice();
    }

    /**
     * Start game logic
     */
    async start() {
        try {
            // Connect to game server
            await this.network.connect(window.location.hostname, 43222);
        } catch (e) {
            console.warn("Could not connect to game server", e);
        }

        // Check if there is an existing state
        const latestState = await this.network.getLatestState();

        if (latestState) {
            // TODO: This could be done in a network'd scene change, to allow having a main menu for example
            this.previousUpdateTime = performance.now();
            this.loadState(latestState);
            // TODO: Maybe this is not the best way to fill previous "unknown" state (?)
            this.rollback.onLateJoin(this.currentState);
            this.debugger.onLateJoin(this.currentState);
        } else {
            this.currentState = new State(this.gameTemplate, this.gameTemplate.loadScene(this.gameTemplate.mainScene));
        }

        this.network.onSceneLoaded(this.currentState.frameIndex);
        this.gameLoop();
    }

    /**
     * Export current game state to text
     * @returns serialized state
     */
    serializeState() {
        return this.currentState.serialize();
    }

    /**
     * Load current game state
     * @param state saved state
     */
    loadState(state: string) {
        this.currentState = State.deserialize(state, this.gameTemplate);
    }

    /**
     * Simulate one tick to the given state
     * @param state to be updated
     * @returns void
     */
    tick(state: State) {
        this.debugger.onTickStart(state);
        // TODO: Is this really the correct place to do it? Rollback will set it back to false
        this.network.packetSentThisFrame = false;

        state.frameIndex++;

        for (const system of this.systems) {
            if (!system.updateAll && !system.update) {
                continue;
            }

            const matchingEntityGroups = SystemManager.getAffectedEntities(system, state.entities);

            if (system.updateAll) {
                for (const entities of matchingEntityGroups) {
                    for (const entity of entities) {
                        system.updateAll.call(this.getAPIForState(state), entity);
                    }
                }
            }

            system.update?.call(this.getAPIForState(state), ...matchingEntityGroups);
        }

        // Add any created entity during this tick to the state
        this.entitiesAPI.spawnQueuedEntities(state.entities);
        this.entitiesAPI.deleteMarkedEntities(state.entities);

        this.debugger.onTickEnd();
    }

    /**
     * Render the given state to the canvas
     * @param state 
     */
    render(state: State) {
        this.debugger.onRenderStart();
        this.gameCanvas.clear();

        for (const system of this.systems) {
            if (!system.render && !system.renderAll) {
                continue;
            }

            const matchingEntityGroups = SystemManager.getAffectedEntities(system, state.entities);

            if (system.renderAll) {
                for (const entities of matchingEntityGroups) {
                    for (const entity of entities) {
                        system.renderAll.call(this.getAPIForState(state), this.gameCanvas.canvas, this.gameCanvas.ctx, entity);
                    }
                }
            }

            if (matchingEntityGroups.length > 0) {
                system.render?.call(this.getAPIForState(state), this.gameCanvas.canvas, this.gameCanvas.ctx, ...matchingEntityGroups);
            }
        }

        this.debugger.onRenderEnd();
    }

    getAPIForState(state: State): SystemContext {
        this.actionsAPI.state = state;
        return {
            actions: this.actionsAPI,
            entities: this.entitiesAPI,
            meta: this.metaAPI
        };
    }

    applyNetworkActions() {
        const actions = this.network.actionQueue;

        let earliestFrame = Infinity;
        for (const action of actions) {
            const frameIndex = action[0];
            // Action is not in the future
            if (frameIndex < this.currentState.frameIndex) {
                for (const playerId in action[1]) {
                    if (this.rollback.updateStateBuffer(frameIndex, playerId, action[1][playerId])) {
                        if (frameIndex < earliestFrame) {
                            earliestFrame = frameIndex;
                        }
                    }
                }

                actions.delete(frameIndex);
            }
        }

        if (earliestFrame !== Infinity) {
            // TODO: Game dev must double check that events are valid
            this.debugger.onRollbackStart();
            this.rollbackFromFrame(earliestFrame);
            this.debugger.onRollbackEnd();
        }
    }

    rollbackFromFrame(index: number) {
        // To make the game more fair:
        // - if action was sent but then cancelled bc of rollback, send a "cancel" info
        // - if action was not sent but the could be done bc of rollback, send it
        // the following case will make sure an action is not lost because of rollback but fairness has to be check manually
        // additionally if it could technically be performed because of rollback it will also be ignored (though this could be desired)
        this.debugger.inRollback = true;
        this.network.ignoreEventBroadcast = true;
        this.currentState = this.rollback.recomputeStateSinceFrame(index);
        this.network.ignoreEventBroadcast = false;
        this.debugger.inRollback = false;
    }

    predictNextActions() {
        if (this.debugger.noPrediction) {
            return;
        }

        const predictions = this.network.predictions;
        for (const playerId in predictions) {
            if (playerId !== this.network.localId) {
                for (const action of predictions[playerId].actions) {
                    const actionDefinition = this.gameTemplate.gameMetadata.actions[action.context]?.[action.type];
                    // Don't predict actions that does not have a definition (join, leave) or action that are only triggered once
                    if (actionDefinition && !actionDefinition.fireOnce && !actionDefinition.mouseMove) {
                        this.currentState.actions.push(action);
                    }
                }
            }
        }
    }

    /**
     * Create actions from inputs for current context for local player
     */
    setActionsFromInputs() {
        const actions = this.gameTemplate.gameMetadata.actions[this.currentState.actionContext];
        const clearKeys = [];

        if (actions) {
            const actionsPerformed: NetworkAction[] = [];
            const localActionsPerformed: NetworkAction[] = [];
            for (const actionType in actions) {
                const action = actions[actionType];
                const performingAction = this.inputs.performingAction(action);

                if (performingAction) {
                    // TODO: fireOnce should not clear keys as 2 actions could technically share the same key
                    // TODO: fireOnce could be used instead of mouseClick? Maybe could have keysPressed and keysHeld instead?
                    if (action.fireOnce) {
                        clearKeys.push(...action.keys);
                    }

                    let networkAction: NetworkAction = actionType;

                    if (this.inputs.isMouseAction(action)) {
                        networkAction = {
                            type: actionType,
                            data: this.inputs.getMousePos()
                        };
                    }

                    // undefined => true
                    if (action.synchronized === false) {
                        localActionsPerformed.push(networkAction);
                    } else {
                        actionsPerformed.push(networkAction);
                    }
                }
            }

            for (const key of clearKeys) {
                this.inputs.clearHeld(key);
            }

            this.network.sendToAll(actionsPerformed, localActionsPerformed, this.currentState.actionContext, this.currentState.frameIndex);
        } else {
            console.warn("Invalid action state: ", this.currentState.actionContext);
        }
    }

    gameLoop = () => {
        this.applyNetworkActions();

        // Based on https://gameprogrammingpatterns.com/game-loop.html
        const currentTime = performance.now();
        const elapsedTime = currentTime - this.previousUpdateTime;
        this.previousUpdateTime = currentTime;
        this.updateLag += elapsedTime;

        let updateCount = 0;

        // Simulate as many frames as needed, but not more than max catchup frames
        // TODO: Limit number of frames to a specific amount of ms instead of number
        while (this.updateLag >= this.MS_PER_FRAME && updateCount < this.MAX_CATCHUP_FRAMES && !this.debugger.pauseLoop) {
            updateCount++;

            this.currentState.clearActions();
            this.setActionsFromInputs();
            this.predictNextActions();
            this.rollback.saveNewStateToBuffer(this.currentState);

            this.tick(this.currentState);
            this.updateLag -= this.MS_PER_FRAME;

            this.inputs.onFrameEnd();
        }

        let state = this.currentState;
        if (this.debugger.overrideRenderedState) {
            state = this.debugger.overrideRenderedState;
        }

        this.render(state);
        this.debugger.renderDebug(this.gameCanvas.ctx, this.gameCanvas.canvas, state);
        this.debugger.onGameLoopEnd(updateCount);

        requestAnimationFrame(this.gameLoop);
    };
}