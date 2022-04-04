export class GameCanvas {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(private containerElement: HTMLElement, private _resolution = { width: 1920, height: 1080 }) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.containerElement.appendChild(this.canvas);

        this.canvas.width = this.resolution.width;
        this.canvas.height = this.resolution.height;

        window.addEventListener("resize", this.resize.bind(this));

        this.resize();
    }

    get resolution() {
        return this._resolution;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize() {
        const ratio = this.resolution.height / this.resolution.width;
        // TODO: Instead of keeping same resolution, should resize canvas width / height and scale for better perfs
        // canvas width is set to 100%, which is the width of the div
        this.canvas.style.height = this.containerElement.offsetWidth * ratio + "px";
    }
}