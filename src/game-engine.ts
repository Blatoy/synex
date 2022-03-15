export class GameEngine {
    engineName: string;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    options;
    targetDiv;

    constructor(engineName: string, targetDiv: HTMLDivElement, options = {
        resolution: {
            width: 1920,
            height: 1080
        }
    }) {
        this.options = options;
        this.engineName = engineName;
        this.targetDiv = targetDiv;

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.targetDiv.appendChild(this.canvas);

        this.canvas.width = this.options.resolution.width;
        this.canvas.height = this.options.resolution.height;

        window.addEventListener("resize", this.resizeGameCanvas.bind(this));
        this.resizeGameCanvas();
    }

    resizeGameCanvas() {
        const ratio = this.options.resolution.height / this.options.resolution.width;
        // canvas width is set to 100%, which is the width of the div
        this.canvas.style.height = this.targetDiv.offsetWidth * ratio + "px";
    }

    start() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "25px monospace";
        this.ctx.fillText(`${this.engineName} : ${this.canvas.width}x${this.canvas.height}`, 30, 30);

        requestAnimationFrame(this.render.bind(this));
    }
}