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
import { Network } from "network.js";

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

    gameCanvas;

    constructor(
        public name: string,
        private gameTemplate: GameTemplate,
        canvasContainer: HTMLElement
    ) {
        this.gameCanvas = new GameCanvas(canvasContainer);
        this.debugger = new EngineDebugger(this);
        this.inputs = new EngineInput();
        this.network = new Network(this);
        this.rollback = new Rollback(this);
        this.actionsAPI = new ActionsAPI(this.currentState);
        this.entitiesAPI = new EntitiesAPI();
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
        let connected = false;
        try {
            // Connect to game server
            await this.network.connect(window.location.hostname, 43222);

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

            connected = true;
        } catch (e) {
            console.warn("Could not connect to game server", e);
        }

        if (connected) {
            this.network.onSceneLoaded(this.currentState.frameIndex);
            this.gameLoop();
        }
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
            entities: this.entitiesAPI
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

                // TODO: Prediction could be done here
                actions.delete(frameIndex);
            }
        }

        if (earliestFrame !== Infinity) {
            // TODO: Prevent sending events again while rollback
            // TODO: Game dev must double check that events are valid
            // TODO: Visualize rollback
            this.debugger.onRollbackStart();
            this.rollbackFromFrame(earliestFrame);
            this.debugger.onRollbackEnd();
        }
    }

    rollbackFromFrame(index: number) {
        this.currentState = this.rollback.recomputeStateSinceFrame(index);
    }

    predictNextActions() {
        if (this.debugger.noPrediction) {
            return;
        }

        const predictions = this.network.predictions;
        for (const playerId in predictions) {
            if (playerId !== this.network.localId) {
                for (const action of predictions[playerId].actions) {
                    this.currentState.actions.push(action);
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
            const actionsPerformed: string[] = [];
            for (const actionType in actions) {
                const action = actions[actionType];
                const performingAction = action.keys.some(key => this.inputs.isHeld(key));
                if (performingAction) {
                    if (action.fireOnce) {
                        clearKeys.push(...action.keys);
                    }

                    actionsPerformed.push(actionType);
                }
            }

            for (const key of clearKeys) {
                this.inputs.clearHeld(key);
            }

            this.network.sendToAll(actionsPerformed, this.currentState.actionContext, this.currentState.frameIndex);
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
            this.rollback.saveStateToBuffer(this.currentState);

            this.tick(this.currentState);
            this.updateLag -= this.MS_PER_FRAME;
        }

        this.render(this.currentState);
        this.debugger.renderDebug(this.gameCanvas.ctx, this.gameCanvas.canvas, this.currentState);
        this.debugger.onGameLoopEnd(updateCount);

        requestAnimationFrame(this.gameLoop);
    };
}