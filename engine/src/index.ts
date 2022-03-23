import { GameEngine } from "./game-engine.js";
import { Game } from "./game.js";

let game1, game2;
window.addEventListener("load", async () => {
    const game = new Game("/generated/games/test-game");
    await game.load();
    game1 = new GameEngine("Game 1", document.getElementById("game-1") as HTMLDivElement, game);
    game2 = new GameEngine("Game 2", document.getElementById("game-2") as HTMLDivElement, game);
    game1.start();
    game2.start();
});