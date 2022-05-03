import { Engine } from "engine/engine.js";
import { GameTemplate } from "engine/game-template.js";

let engine: Engine;
const gameTemplate = new GameTemplate("/scripts/games/demo-game");

window.addEventListener("load", async () => {
    await gameTemplate.load();
    engine = new Engine("Engine 1", gameTemplate, document.getElementById("game") as HTMLDivElement);
    engine.start();
});

document.addEventListener("keydown", async (e) => {
    if (e.key === "r") {
        await gameTemplate.reload();
        engine.reloadGameTemplate();
    }
});