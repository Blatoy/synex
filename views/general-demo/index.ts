import { Engine } from "engine/engine.js";
import { GameTemplate } from "engine/game-template.js";

const engines: Engine[] = [];
const gameTemplate = new GameTemplate("/scripts/games/demo-game");

window.addEventListener("load", async () => {

    await gameTemplate.load();

    engines.push(new Engine("Engine 1", gameTemplate, document.getElementById("game-1") as HTMLDivElement));
    engines.push(new Engine("Engine 2", gameTemplate, document.getElementById("game-2") as HTMLDivElement));

    engines[1].inputs.ignoreInputs = true;

    engines.forEach((engine) => {
        engine.gameCanvas.canvas.addEventListener("click", () => {
            engines.forEach((engine) => {
                engine.inputs.ignoreInputs = true;
            });
            engine.inputs.ignoreInputs = false;
        });
    });

    engines[0].start();
    // engines[1].start();
    setTimeout(() => {
        engines[1].start();
    }, 100);

    (window as any).engines = engines;
    (window as any).mode = 1;
});

window.addEventListener("focus", async () => {
    await gameTemplate.reload();
    engines.forEach((engine) => {
        engine.reloadGameTemplate();
    });
});

document.addEventListener("keydown", async (e) => {
    if (e.key === "r") {
        await gameTemplate.reload();
        engines.forEach((engine) => {
            engine.reloadGameTemplate();
        });
    }
    if (e.key === "t") {
        engines.forEach((engine) => {
            engine.rollbackFromFrame(engine.currentState.frameIndex - 120);
        });
    }
    if (e.key === "0") {
        engines.forEach((engine) => {
            engine.rollbackFromFrame(0);
        });
    }
});