import { GameEngine } from "./game-engine.js";
import { Game } from "./game.js";

let engine1, engine2;
window.addEventListener("load", async () => {
    const game = new Game("/generated/games/test-game");
    await game.load();

    engine1 = new GameEngine("Game 1", document.getElementById("game-1") as HTMLDivElement, game);
    engine2 = new GameEngine("Game 2", document.getElementById("game-2") as HTMLDivElement, game);
    engine1.start();
    engine2.start();
});