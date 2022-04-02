import { Engine } from "engine/engine.js";
import { GameTemplate } from "engine/game-template.js";

const engines: Engine[] = [];
const gameTemplate = new GameTemplate("/scripts/games/test-game");

window.addEventListener("load", async () => {

    await gameTemplate.load();

    engines.push(new Engine("Engine 1", gameTemplate, document.getElementById("game-1") as HTMLDivElement));
    engines.push(new Engine("Engine 2", gameTemplate, document.getElementById("game-2") as HTMLDivElement));

    engines.forEach((engine) => {
        engine.start();
    });
});

document.addEventListener("keydown", async (e) => {
    if (e.key === "r") {
        await gameTemplate.reload();
        engines.forEach((engine) => {
            engine.reloadGameTemplate();
        });
    }
});