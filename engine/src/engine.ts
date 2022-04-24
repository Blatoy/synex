import { State } from "./frame-state.js";
import { GameCanvas } from "game-canvas.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { System, SystemContext } from "game-lib/types/system.js";
import { GameTemplate } from "game-template.js";
import { EngineDebugger } from "engine-debug.js";
import { ActionsAPI } from "game-api/actions-api.js";
import { EngineInput } from "engine-input.js";
import { Rollback } from "rollback.js";


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
    rollback: Rollback;
    actionsAPI: ActionsAPI;

    gameCanvas;

    constructor(
        public name: string,
        private gameTemplate: GameTemplate,
        canvasContainer: HTMLElement
    ) {
        this.gameCanvas = new GameCanvas(canvasContainer);
        this.debugger = new EngineDebugger(this);
        this.inputs = new EngineInput();
        this.rollback = new Rollback(this);
        this.actionsAPI = new ActionsAPI(this.currentState);
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
    start() {
        this.currentState = new State(this.gameTemplate, this.gameTemplate.loadScene(this.gameTemplate.mainScene));
        this.gameLoop();
    }

    /**
     * Export current game state to text
     * @returns serialized state
     */
    saveState() {
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

            system.render?.call(this.getAPIForState(state), this.gameCanvas.canvas, this.gameCanvas.ctx, ...matchingEntityGroups);
        }

        this.debugger.onRenderEnd();
    }

    getAPIForState(state: State): SystemContext {
        this.actionsAPI.state = state;
        return {
            actions: this.actionsAPI
        };
    }

    rollbackFromFrame(index: number) {
        this.currentState = this.rollback.recomputeStateSinceFrame(index);
    }

    /**
     * Create actions from inputs for current context for local player
     */
    setActionsFromInputs() {
        const actions = this.gameTemplate.gameMetadata.actions[this.currentState.actionContext];
        const clearKeys = [];

        if (actions) {
            for (const actionType in actions) {
                const action = actions[actionType];
                const performingAction = action.keys.some(key => this.inputs.isHeld(key));
                if (performingAction) {
                    if (action.fireOnce) {
                        clearKeys.push(...action.keys);
                    }

                    this.currentState.actions.push({
                        ownerId: -1,
                        type: actionType,
                        context: this.currentState.actionContext
                    });
                }
            }

            for (const key of clearKeys) {
                this.inputs.clearHeld(key);
            }
        } else {
            console.warn("Invalid action state: ", this.currentState.actionContext);
        }
    }

    // Based on https://gameprogrammingpatterns.com/game-loop.html
    gameLoop() {
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
            this.rollback.saveStateToBuffer(this.currentState);

            this.tick(this.currentState);
            this.updateLag -= this.MS_PER_FRAME;
        }

        this.render(this.currentState);
        this.debugger.renderDebug(this.gameCanvas.ctx, this.gameCanvas.canvas, this.currentState);
        this.debugger.onGameLoopEnd(updateCount);

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}