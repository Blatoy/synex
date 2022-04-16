import { State } from "./frame-state.js";
import { GameCanvas } from "game-canvas.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { System, SystemContext } from "game-lib/types/system.js";
import { GameTemplate } from "game-template.js";
import { EngineDebugger } from "engine-debug.js";
import { ActionsAPI } from "game-api/actions-api.js";
import { EngineInput } from "engine-input.js";


export class Engine {
    // TODO: Move into multiline constructor
    systems: System[] = [];
    currentState: State = new State();
    stateBuffer: State[] = [];
    gameCanvas;

    readonly targetUPS = 60; // TODO: Let the game set that
    readonly msPerFrame = 1000 / this.targetUPS;
    readonly maxCatchupFrames = 100;
    readonly fullSaveStateFrameCount = 60;
    previousUpdateTime = performance.now();
    updateLag = 0;
    debugger: EngineDebugger;
    inputs: EngineInput;

    replayIndex = -1;

    constructor(public name: string, private gameTemplate: GameTemplate, canvasContainer: HTMLElement) {
        this.gameCanvas = new GameCanvas(canvasContainer);
        this.debugger = new EngineDebugger(this);
        this.inputs = new EngineInput();
        this.actionsAPI = new ActionsAPI(this.currentState);
        this.reloadGameTemplate();
    }

    public reloadGameTemplate() {
        // TODO: Synchronize reloading game in multiplayer?
        this.systems = this.gameTemplate.systems.slice();
    }

    start() {
        this.currentState = new State(this.gameTemplate.loadScene(this.gameTemplate.mainScene));
        this.gameLoop();
    }

    saveState() {
        return this.currentState.serialize();
    }

    loadState(state: string) {
        this.currentState = State.deserialize(state, this.gameTemplate);
    }

    tick(state: State) {
        this.debugger.onTickStart(state);
        if (this.debugger.cancelTick) {
            return;
        }

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

    setActionsFromInputs() {
        const actions = this.gameTemplate.gameMetadata.actions[this.currentState.actionContext];
        const clearKeys = [];

        this.currentState.actions = [];

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

    saveStateToBuffer() {
        if (this.currentState.frameIndex % this.fullSaveStateFrameCount === 0) {
            this.stateBuffer.push(this.currentState.clone(this.gameTemplate));
        } else {
            this.stateBuffer.push(this.currentState.lightClone());
        }
    }

    setActionsFromReplay() {
        if (this.replayIndex >= this.stateBuffer.length) {
            this.replayIndex = -1;
            return;
        }

        const savedState = this.stateBuffer[this.replayIndex++];
        if (savedState.entities.length > 0) {
            this.currentState = savedState.clone(this.gameTemplate);
        } else {
            this.currentState.actions = savedState.actions;
            this.currentState.actionContext = savedState.actionContext;
            this.currentState.frameIndex = savedState.frameIndex;
        }
    }

    // Based on https://gameprogrammingpatterns.com/game-loop.html
    gameLoop() {
        this.debugger.onGameLoopStart();

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.previousUpdateTime;
        this.previousUpdateTime = currentTime;
        this.updateLag += elapsedTime;

        let updateCount = 0;
        while (this.updateLag >= this.msPerFrame && updateCount < this.maxCatchupFrames) {
            updateCount++;

            if (this.replayIndex === -1) {
                this.setActionsFromInputs();
                this.saveStateToBuffer();
            } else {
                this.setActionsFromReplay();
            }

            this.tick(this.currentState);
            this.updateLag -= this.msPerFrame;
        }

        this.render(this.currentState);
        this.debugger.renderDebug(this.gameCanvas.ctx, this.currentState);

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}