import { State } from "./frame-state.js";
import { Engine } from "engine.js";
import { Graphics, GraphType, LabelType } from "graphs.js";


export class EngineDebugger {
    private _pauseLoop = false;
    private stepByStep = false;
    private breakFrames: number[] = [];
    private lagHistory: number[] = [];
    private maxLag = 1;

    timers = {
        tickStart: 0,
        renderStart: 0
    };

    times = {
        lastTick: 0,
        lastRender: 0,
    };

    constructor(private engine: Engine) { }

    pause() {
        this._pauseLoop = true;
    }

    unpause() {
        this._pauseLoop = false;
        this.stepByStep = false;
    }

    addBreakFrame(index: number) {
        this.breakFrames.push(index);
    }

    step() {
        this.stepByStep = true;
        this._pauseLoop = false;
    }

    get pauseLoop() {
        return this._pauseLoop;
    }

    onGameLoopEnd() {
        this.lagHistory.push(this.engine.updateLag);
        if (this.engine.updateLag > this.maxLag) {
            this.maxLag = this.engine.updateLag;
        }
    }

    onTickStart(state: State) {
        if (this.breakFrames.includes(state.frameIndex)) {
            this._pauseLoop = true;
        }

        this.timers.tickStart = performance.now();

        return this._pauseLoop;
    }

    onTickEnd() {
        this.times.lastTick = performance.now() - this.timers.tickStart;

        if (this.stepByStep) {
            this.stepByStep = false;
            this._pauseLoop = true;
        }
    }

    onRenderStart() {
        this.timers.renderStart = performance.now();
    }

    onRenderEnd() {
        this.times.lastRender = performance.now() - this.timers.renderStart;
    }

    renderDebug(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: State) {
        const h = this.engine.gameCanvas.canvas.height;
        const w = this.engine.gameCanvas.canvas.width;

        let debugYPos = 0;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "32px monospace";
        ctx.fillText("= " + this.engine.name + " =", 10, debugYPos += 30);
        ctx.fillText("frame: " + state.frameIndex, 10, debugYPos += 30);
        ctx.fillText("tick : " + this.times.lastTick.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("rend : " + this.times.lastRender.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("lag  : " + this.engine.updateLag.toFixed(2) + "ms " + (this.engine.updateLag > this.engine.MS_PER_FRAME ? " (can't keep up!)" : ""), 10, debugYPos += 30);
        ctx.fillText("ctx  : " + this.engine.currentState.actionContext, 10, debugYPos += 30);
        ctx.fillText("acts : " + this.engine.currentState.actions.map(a => `${a.ownerId}:${a.type}`).join(", "), 10, debugYPos += 30);

        let barIndex = 0;
        Graphics.renderGraph(ctx, {
            data: this.engine.rollback.stateBuffer.map(s => {
                return {
                    colors: s.actions.map(a => Graphics.colorFromText(a.context)),
                    values: s.actions.map(_ => 1)
                };
            }),
            type: GraphType.bars,
            labels: {
                title: "Actions count and their context in frames buffer",
                bottomCenter: { type: LabelType.middle },
                topLeft: { prefix: "max displayed action count: ", type: LabelType.maxValue },
                topRight: { prefix: "max displayed action count: ", type: LabelType.maxValue },
                bottomLeft: { type: LabelType.start },
                bottomRight: { type: LabelType.end }
            },
            crop: Graphics.cropEnd(this.engine.rollback.stateBuffer.length, 60 * 5),
            position: { x: 0, y: canvas.height * (0.85 - barIndex++ * 0.16) },
            size: { w: canvas.width, h: canvas.height * 0.15 }
        });

        Graphics.renderGraph(ctx, {
            slidingAverage: 10,
            data: this.lagHistory,
            type: GraphType.lines,
            maxValue: 20,
            minValue: 0,
            labels: {
                title: "Lag over time",
                bottomCenter: { type: LabelType.middle },
                topLeft: { suffix: " ms", decimals: 0, type: LabelType.maxValue },
                topRight: { suffix: " ms", decimals: 0, type: LabelType.maxValue },
                bottomRight: { type: LabelType.end },
                yAxisZero: { suffix: " ms", decimals: 0, type: LabelType.minValue },
                xAxisZero: { type: LabelType.start },
            },
            crop: Graphics.cropEnd(this.lagHistory.length, 60 * 5),
            position: { x: 0, y: canvas.height * (0.85 - barIndex++ * 0.16) },
            size: { w: canvas.width, h: canvas.height * 0.15 }
        });

        ctx.restore();
    }
}