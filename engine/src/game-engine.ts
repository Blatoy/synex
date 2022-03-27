import { Game } from "./game.js";

export class GameEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    gameTemplate;

    constructor(public engineName: string, public targetDiv: HTMLDivElement, game: Game, public options = {
        resolution: {
            width: 1920,
            height: 1080
        }
    }) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.targetDiv.appendChild(this.canvas);

        this.canvas.width = this.options.resolution.width;
        this.canvas.height = this.options.resolution.height;

        this.gameTemplate = game;

        window.addEventListener("resize", this.resizeGameCanvas.bind(this));
        this.resizeGameCanvas();
    }

    private instantiateSystems() {
        this.systems = this.gameTemplate.getSystems().map(system => new system());
    }

    async reloadSystems() {
        await this.gameTemplate.load();
        this.instantiateSystems();
    }

    resizeGameCanvas() {
        const ratio = this.options.resolution.height / this.options.resolution.width;
        // TODO: Instead of keeping same resolution, should resize canvas width / height and scale for better perfs
        // canvas width is set to 100%, which is the width of the div
        this.canvas.style.height = this.targetDiv.offsetWidth * ratio + "px";
    }

    start() {
        this.instantiateSystems();
        this.render();
    }

    render() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "25px monospace";
        this.ctx.fillText(`${this.engineName} : ${this.canvas.width}x${this.canvas.height}`, 30, 30);

        this.ctx.fillRect(100, 100, 50, 50);

        requestAnimationFrame(this.render.bind(this));
    }
}