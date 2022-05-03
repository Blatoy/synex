import { State } from "./frame-state.js";
import { Engine } from "engine.js";
import { Graphics, GraphSettings, GraphType, LabelType } from "graphs.js";


export enum DebugMode {
    DISABLED,
    ALL_GRAPHS,
    ROLLBACK,
    ROLLBACK_SIMPLE
}

export class EngineDebugger {
    private _pauseLoop = false;
    private stepByStep = false;
    private breakFrames: number[] = [];
    private lagHistory: number[] = [];
    private rollbackCountPerFrame: number[] = [];
    private tickTimeHistory: number[] = [];
    private renderTimeHistory: number[] = [];
    private updateCountHistory: number[] = [];

    debugLevel = DebugMode.ROLLBACK_SIMPLE;

    timers = {
        tickStart: 0,
        renderStart: 0,
        rollbackStart: 0
    };

    times = {
        lastTick: 0,
        lastRender: 0,
        lastRollback: 0
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

    onLateJoin(state: State) {
        this.rollbackCountPerFrame = [];
        for (let i = 0; i < state.frameIndex; i++) {
            this.rollbackCountPerFrame.push(-1); // -1 => cannot rollback
        }
    }

    debugDisabled() {
        return this.debugLevel === DebugMode.DISABLED;
    }

    onGameLoopEnd(updateCount: number) {
        if (this.debugDisabled()) {
            return;
        }

        this.lagHistory.push(this.engine.updateLag);
        this.updateCountHistory.push(updateCount);
    }

    onTickStart(state: State) {
        if (this.debugDisabled()) {
            return;
        }

        if (this.breakFrames.includes(state.frameIndex)) {
            this._pauseLoop = true;
        }

        if (this.rollbackCountPerFrame[state.frameIndex] === undefined) {
            this.rollbackCountPerFrame[state.frameIndex] = 0;
        } else {
            this.rollbackCountPerFrame[state.frameIndex]++;
        }

        this.timers.tickStart = performance.now();

        return this._pauseLoop;
    }

    onTickEnd() {
        if (this.debugDisabled()) {
            return;
        }

        this.times.lastTick = performance.now() - this.timers.tickStart;
        this.tickTimeHistory.push(this.times.lastTick);

        if (this.stepByStep) {
            this.stepByStep = false;
            this._pauseLoop = true;
        }
    }

    onRenderStart() {
        if (this.debugDisabled()) {
            return;
        }

        this.timers.renderStart = performance.now();
    }

    onRollbackStart() {
        if (this.debugDisabled()) {
            return;
        }

        this.timers.rollbackStart = performance.now();
    }
    onRollbackEnd() {
        if (this.debugDisabled()) {
            return;
        }

        this.times.lastRollback = performance.now() - this.timers.rollbackStart;
    }

    onRenderEnd() {
        if (this.debugDisabled()) {
            return;
        }

        this.times.lastRender = performance.now() - this.timers.renderStart;
        this.renderTimeHistory.push(this.times.lastRender);
    }

    private drawGraphGrid(y: number, x: number, graphCount: number, height: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, graphSettings: Omit<Omit<GraphSettings, "position">, "size">) {
        const graphSize = 0.16;
        const offsetY = 0.001;
        const offsetX = 0.0002;

        const settings = graphSettings as GraphSettings;

        settings.position = {
            x: x * (canvas.width / graphCount) + x * offsetX * canvas.width,
            y: canvas.height * (1 - (y + 1) * graphSize - y * offsetY)
        };

        settings.size = {
            w: canvas.width / (graphCount) - (graphCount - 1) * offsetX * canvas.width,
            h: canvas.height * (graphSize * height + (height - 1) * offsetY)
        };

        Graphics.renderGraph(ctx, settings);
    }

    renderDebug(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: State) {
        if (this.debugDisabled()) {
            return;
        }

        let debugYPos = 0;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "32px monospace";
        ctx.fillText("= " + this.engine.name + " =", 10, debugYPos += 30);
        ctx.fillText("frame: " + state.frameIndex, 10, debugYPos += 30);
        ctx.fillText("tick : " + this.times.lastTick.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("rlbc : " + this.times.lastRollback.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("rend : " + this.times.lastRender.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("lag  : " + this.engine.updateLag.toFixed(2) + "ms " + (this.engine.updateLag > this.engine.MS_PER_FRAME ? " (can't keep up!)" : ""), 10, debugYPos += 30);
        ctx.fillText("ctx  : " + this.engine.currentState.actionContext, 10, debugYPos += 30);
        ctx.fillText("acts : " + this.engine.currentState.actions.map(a => `${a.ownerId}:${a.type}`).join(", "), 10, debugYPos += 30);
        ctx.fillText("sble : " + this.engine.rollback.stateBuffer.length, 10, debugYPos += 30);

        const actionCountGraph = {
            data: this.engine.rollback.stateBuffer.map(s => {
                return {
                    colors: s.actions.map(a => Graphics.colorFromText(a.context + a.ownerId.repeat(4))),
                    values: s.actions.map(_ => 1)
                };
            }),
            type: GraphType.bars,
            labels: {
                title: "Actions count and their context in frames buffer",
                bottomCenter: { type: LabelType.middle },
                topLeft: { type: LabelType.maxValue },
                topRight: { type: LabelType.maxValue },
                bottomLeft: { type: LabelType.start },
                bottomRight: { type: LabelType.end }
            },
            crop: Graphics.cropEnd(this.engine.rollback.stateBuffer.length, 60 * 5)
        };

        const stateBufferType = {
            data: this.engine.rollback.stateBuffer.map(s => {
                return {
                    colors: [s.onlyActions ? "dodgerblue" : "orangered"],
                    values: [s.onlyActions ? 1 : 2]
                };
            }),
            minValue: 0,
            maxValue: 2,
            type: GraphType.bars,
            labels: {
                title: "Full snapshot vs actions only snapshot",
                bottomCenter: { type: LabelType.middle },
                bottomLeft: { type: LabelType.start },
                bottomRight: { type: LabelType.end }
            },
            crop: Graphics.cropEnd(this.engine.rollback.stateBuffer.length, 60 * 5)
        };

        const rollBackGraph = {
            data: this.rollbackCountPerFrame,
            type: GraphType.bars,
            labels: {
                title: "Number of time a frame has been rolled back",
                bottomCenter: { type: LabelType.middle },
                bottomLeft: { type: LabelType.start },
                topLeft: { type: LabelType.maxValue },
                topRight: { type: LabelType.maxValue },
                bottomRight: { type: LabelType.end }
            },
            crop: Graphics.cropEnd(this.rollbackCountPerFrame.length, 60 * 5)
        };

        const renderTimeGraph = {
            data: this.renderTimeHistory,
            type: GraphType.lines,
            labels: {
                title: "Render time history",
                bottomCenter: { type: LabelType.middle },
                topLeft: { suffix: " ms", decimals: 0, type: LabelType.maxValue },
                topRight: { suffix: " ms", decimals: 0, type: LabelType.maxValue },
                bottomRight: { type: LabelType.end },
                xAxisZero: { type: LabelType.start },
            },
            crop: Graphics.cropEnd(this.renderTimeHistory.length, 60 * 5)
        };

        const tickTimeGraph = {
            data: this.tickTimeHistory,
            type: GraphType.lines,
            labels: {
                title: "Tick time history",
                bottomCenter: { type: LabelType.middle },
                topLeft: { decimals: 2, type: LabelType.maxValue },
                topRight: { decimals: 2, type: LabelType.maxValue },
                bottomRight: { type: LabelType.end },
                bottomLeft: { type: LabelType.start },
            },
            crop: Graphics.cropEnd(this.tickTimeHistory.length, 60 * 5)
        };

        const lagOverTimeGraph = {
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
                xAxisZero: { type: LabelType.start },
            },
            crop: Graphics.cropEnd(this.lagHistory.length, 60 * 5)
        };

        const tickCountGraph = {
            slidingAverage: 10,
            data: this.updateCountHistory,
            type: GraphType.bars,
            labels: {
                title: "Tick count per frame",
                bottomCenter: { type: LabelType.middle },
                topLeft: { decimals: 0, type: LabelType.maxValue },
                topRight: { decimals: 0, type: LabelType.maxValue },
                bottomRight: { type: LabelType.end },
                bottomLeft: { type: LabelType.start },
            },
            crop: Graphics.cropEnd(this.updateCountHistory.length, 60 * 5)
        };

        switch (this.debugLevel) {
            case DebugMode.ALL_GRAPHS:
                this.drawGraphGrid(0, 0, 1.5, 1, ctx, canvas, actionCountGraph);
                this.drawGraphGrid(1, 0, 1.5, 1, ctx, canvas, rollBackGraph);
                this.drawGraphGrid(2, 2, 3, 1, ctx, canvas, renderTimeGraph);
                this.drawGraphGrid(3, 2, 3, 1, ctx, canvas, tickTimeGraph);
                this.drawGraphGrid(2, 0, 1.5, 1, ctx, canvas, stateBufferType);
                this.drawGraphGrid(1, 2, 3, 1, ctx, canvas, lagOverTimeGraph);
                this.drawGraphGrid(0, 2, 3, 1, ctx, canvas, tickCountGraph);
                break;
            case DebugMode.ROLLBACK_SIMPLE:
                this.drawGraphGrid(0, 0, 1, 1, ctx, canvas, actionCountGraph);
                this.drawGraphGrid(1, 0, 1, 1, ctx, canvas, rollBackGraph);
                break;
            case DebugMode.ROLLBACK:
                this.drawGraphGrid(0, 0, 1, 1, ctx, canvas, actionCountGraph);
                this.drawGraphGrid(1, 0, 1, 1, ctx, canvas, rollBackGraph);
                this.drawGraphGrid(2, 0, 1, 1, ctx, canvas, stateBufferType);
                break;
        }


        ctx.restore();
    }
}