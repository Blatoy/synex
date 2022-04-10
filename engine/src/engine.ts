import { State } from "./frame-state.js";
import { GameCanvas } from "game-canvas.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { System } from "game-lib/types/system.js";
import { GameTemplate } from "game-template.js";
import { EngineDebugger } from "engine-debug.js";


export class Engine {
    systems: System[] = [];
    currentState: State = new State();
    gameCanvas;

    readonly targetUPS = 60; // TODO: Let the game set that
    readonly msPerFrame = 1000 / this.targetUPS;
    readonly maxCatchupFrames = 100;
    previousUpdateTime = performance.now();
    updateLag = 0;
    debugger: EngineDebugger;

    constructor(public name: string, private gameTemplate: GameTemplate, canvasContainer: HTMLElement) {
        this.gameCanvas = new GameCanvas(canvasContainer);
        this.debugger = new EngineDebugger(this);
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
                        system.updateAll(entity);
                    }
                }
            }

            system.update?.(...matchingEntityGroups);
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
                        system.renderAll(this.gameCanvas.canvas, this.gameCanvas.ctx, entity);
                    }
                }
            }

            system.render?.(this.gameCanvas.canvas, this.gameCanvas.ctx, ...matchingEntityGroups);
        }

        this.debugger.onRenderEnd();
    }


    gameLoop() {
        this.debugger.onGameLoopStart();

        // Based on https://gameprogrammingpatterns.com/game-loop.html
        const currentTime = performance.now();
        const elapsedTime = currentTime - this.previousUpdateTime;
        this.previousUpdateTime = currentTime;
        this.updateLag += elapsedTime;

        let updateCount = 0;
        while (this.updateLag >= this.msPerFrame && updateCount < this.maxCatchupFrames) {
            updateCount++;
            this.tick(this.currentState);
            this.updateLag -= this.msPerFrame;
        }

        this.render(this.currentState);

        this.debugger.renderDebug(this.gameCanvas.ctx, this.currentState);

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}