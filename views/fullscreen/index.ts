import { Engine } from "engine/engine.js";
import { GameTemplate } from "engine/game-template.js";

let engine: Engine;
const gameTemplate = new GameTemplate("/scripts/games/demo-game");

window.addEventListener("load", async () => {
    await gameTemplate.load();
    engine = new Engine("Engine 1", gameTemplate, document.getElementById("game") as HTMLDivElement);
    engine.start();
    (window as any).engines = [engine];
    (window as any).mode = 1;
});

document.addEventListener("keydown", async (e) => {
    if (e.key === "r") {
        await gameTemplate.reload();
        engine.reloadGameTemplate();
    }
    if (e.key === "t") {
        engine.rollbackFromFrame(engine.currentState.frameIndex - 120);
    }
    if (e.key === "0") {
        engine.rollbackFromFrame(0);
    }

    if (e.key === "9") {
        console.log("Re-requesting state");
        
        // Check if there is an existing state
        const latestState = await engine.network.getLatestState();

        if (latestState) {
            // TODO: This could be done in a network'd scene change, to allow having a main menu for example
            engine.previousUpdateTime = performance.now();
            engine.loadState(latestState);
            // TODO: Maybe this is not the best way to fill previous "unknown" state (?)
            engine.rollback.onLateJoin(engine.currentState);
            engine.debugger.onLateJoin(engine.currentState);
        }
    }
});