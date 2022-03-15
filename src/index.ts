import { GameEngine } from "./game-engine.js";

let game1, game2;
window.addEventListener("load", () => {
    game1 = new GameEngine("Game 1", document.getElementById("game-1") as HTMLDivElement);
    game2 = new GameEngine("Game 2", document.getElementById("game-2") as HTMLDivElement);
    game1.start();
    game2.start();
});