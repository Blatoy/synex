import { State } from "./frame-state.js";
import { GameCanvas } from "game-canvas.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { System } from "game-lib/types/system.js";
import { GameTemplate } from "game-template.js";


export class Engine {
    systems: System[] = [];
    currentState: State = new State();
    gameCanvas;
    targetUPS = 60;

    debug = {
        lastTickTime: 0,
        lastRenderTime: 0
    };

    constructor(public name: string, private gameTemplate: GameTemplate, private canvasContainer: HTMLElement) {
        this.gameCanvas = new GameCanvas(canvasContainer);
        this.reloadGameTemplate();
    }

    public reloadGameTemplate() {
        // TODO: Synchronize reloading game in multiplayer?
        this.systems = this.gameTemplate.systems.slice();
    }

    start() {
        this.currentState = new State(this.gameTemplate.loadScene(this.gameTemplate.mainScene));
        console.log(this.currentState, this.systems);

        this.renderLoop();
    }

    tick(state: State) {
        const start = performance.now();
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

        // TODO: Replace by better profiler
        this.debug.lastTickTime = performance.now() - start;
    }

    render(state: State) {
        const start = performance.now();
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

        // TODO: Replace by better profiler
        this.debug.lastRenderTime = performance.now() - start;
    }


    renderLoop() {
        this.gameCanvas.clear();
        this.tick(this.currentState);
        this.render(this.currentState);

        this.gameCanvas.ctx.fillStyle = "white";
        this.gameCanvas.ctx.font = "32px monospace";
        this.gameCanvas.ctx.fillText("tick: " + this.debug.lastTickTime.toFixed(2) + "ms", 10, 30);
        this.gameCanvas.ctx.fillText("rend: " + this.debug.lastRenderTime.toFixed(2) + "ms", 10, 60);

        requestAnimationFrame(this.renderLoop.bind(this));
    }
}