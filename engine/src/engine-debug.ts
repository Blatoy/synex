import { State } from "./frame-state.js";
import { Engine } from "engine.js";
import { Graphics, GraphSettings, GraphType, LabelType } from "graphs.js";

type DefaultGraphSettings = Omit<Omit<GraphSettings, "position">, "size">;

export enum DebugMode {
    DISABLED,
    MINIMAL,
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
    private rollbackReplays: State[][] = [];

    lastFps = 0;
    fps = 0;
    lastUps = 0;
    ups = 0;

    currentRollbackFrame = 0;
    inRollback = false;

    noPrediction = false;
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

    overrideRenderedState: State | undefined;
    rollbackReplayIndex = 0;

    private actionCountGraph: DefaultGraphSettings = {
        data: [],
        type: GraphType.bars,
        labels: {
            title: "Actions count and their context in frames buffer",
            bottomCenter: { type: LabelType.middle },
            topLeft: { type: LabelType.maxValue },
            topRight: { type: LabelType.maxValue },
            bottomLeft: { type: LabelType.start },
            bottomRight: { type: LabelType.end }
        }
    };

    private stateBufferType: DefaultGraphSettings = {
        data: [],
        minValue: 0,
        maxValue: 2,
        type: GraphType.bars,
        labels: {
            title: "Full snapshot vs actions only snapshot",
            bottomCenter: { type: LabelType.middle },
            bottomLeft: { type: LabelType.start },
            bottomRight: { type: LabelType.end }
        }
    };

    private rollBackGraph: DefaultGraphSettings = {
        data: [],
        type: GraphType.bars,
        labels: {
            title: "Number of time a frame has been rolled back",
            bottomCenter: { type: LabelType.middle },
            bottomLeft: { type: LabelType.start },
            topLeft: { type: LabelType.maxValue },
            topRight: { type: LabelType.maxValue },
            bottomRight: { type: LabelType.end }
        }
    };

    private renderTimeGraph: DefaultGraphSettings = {
        data: [],
        type: GraphType.lines,
        labels: {
            title: "Render time history",
            bottomCenter: { type: LabelType.middle },
            topLeft: { suffix: " ms", decimals: 0, type: LabelType.maxValue },
            topRight: { suffix: " ms", decimals: 0, type: LabelType.maxValue },
            bottomRight: { type: LabelType.end },
            xAxisZero: { type: LabelType.start },
        }
    };

    private tickTimeGraph: DefaultGraphSettings = {
        data: [],
        type: GraphType.lines,
        labels: {
            title: "Tick time history",
            bottomCenter: { type: LabelType.middle },
            topLeft: { decimals: 2, type: LabelType.maxValue },
            topRight: { decimals: 2, type: LabelType.maxValue },
            bottomRight: { type: LabelType.end },
            bottomLeft: { type: LabelType.start },
        }
    };

    private lagOverTimeGraph: DefaultGraphSettings = {
        data: [],
        slidingAverage: 10,
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
        }
    };

    private tickCountGraph: DefaultGraphSettings = {
        data: [],
        slidingAverage: 10,
        type: GraphType.bars,
        labels: {
            title: "Tick count per frame",
            bottomCenter: { type: LabelType.middle },
            topLeft: { decimals: 0, type: LabelType.maxValue },
            topRight: { decimals: 0, type: LabelType.maxValue },
            bottomRight: { type: LabelType.end },
            bottomLeft: { type: LabelType.start },
        }
    };


    constructor(private engine: Engine) {
        setInterval(() => {
            this.lastFps = this.fps;
            this.lastUps = this.ups;
            this.fps = 0;
            this.ups = 0;
        }, 1000);
    }

    onRollbackBegin() {
        this.rollbackReplays.push([]);
    }

    onRollbackTick(state: State) {
        if (this.debugDisabled() || this.debugLevel === DebugMode.MINIMAL) {
            return;
        }

        this.rollbackReplays[this.rollbackReplays.length - 1].push(state.clone());
    }

    showRollback(index: number) {
        this.rollbackReplayIndex = index;
        this.overrideRenderedState = this.rollbackReplays[index][0];
    }

    previousRollbackFrame() {
        const replay = this.rollbackReplays[this.rollbackReplayIndex];
        let index = replay.indexOf(this.overrideRenderedState as State);

        if (index <= 0) {
            console.log("Restarting replay");
            index = replay.length - 1;
        } else {
            index--;
        }

        console.log("Replaying, current frame: ", index, "/", replay.length - 1);
        this.overrideRenderedState = replay[index];
    }

    nextRollbackFrame() {
        const replay = this.rollbackReplays[this.rollbackReplayIndex];
        let index = replay.indexOf(this.overrideRenderedState as State);

        if (index >= replay.length - 1) {
            console.log("Restarting replay");
            index = 0;
        } else {
            index++;
        }

        console.log("Replaying, current frame: ", index, "/", replay.length - 1);
        this.overrideRenderedState = replay[index];
    }

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
            this.rollbackCountPerFrame.push(0);
        }
    }

    debugDisabled() {
        return this.debugLevel === DebugMode.DISABLED;
    }

    onGameLoopEnd(updateCount: number) {
        if (this.debugDisabled()) {
            return;
        }

        this.ups += updateCount;

        if (this.debugLevel === DebugMode.MINIMAL) {
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

        if (this.debugLevel === DebugMode.MINIMAL) {
            return;
        }


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

        this.fps++;
        if (this.debugLevel === DebugMode.MINIMAL) {
            return;
        }

        this.times.lastRender = performance.now() - this.timers.renderStart;
        this.renderTimeHistory.push(this.times.lastRender);
    }

    private drawGraphGrid(y: number, x: number, graphCount: number, height: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, graphSettings: DefaultGraphSettings) {
        const graphSize = 0.14;
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

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, 32);

        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "20px monospace";
        ctx.fillText(
            `fps: ${(this.lastFps).toFixed(0)} - ups: ${this.lastUps} - ` +
            `entity count: ${state.entities.length.toString().padStart(4, " ")} - ` +
            `uptime: ${(state.frameIndex / 60).toFixed(0)}s - tick: ${this.times.lastTick.toFixed(2)}ms - ` +
            `render: ${this.times.lastRender.toFixed(2)}ms - rollback: ${this.times.lastRollback.toFixed(2)}ms - ` +
            `update lag: ${this.engine.updateLag.toFixed(2).padStart(5, " ")}ms - ` +
            `rollback buff size: ${this.engine.rollback.stateBuffer.length.toString().padStart(5, " ")}`
            , 10, 7);

        if (this.debugLevel === DebugMode.MINIMAL) {
            return;
        }

        let stateCrop = Graphics.cropEnd(this.engine.rollback.stateBuffer.length, 60 * 3);
        let rollbackCrop = Graphics.cropEnd(this.rollbackCountPerFrame.length, 60 * 3);

        if (this.overrideRenderedState) {
            stateCrop = {
                start: Math.max(0, this.overrideRenderedState.frameIndex - 10),
                end: this.overrideRenderedState.frameIndex
            };

            rollbackCrop = {
                start: Math.max(0, this.overrideRenderedState.frameIndex - 10),
                end: this.overrideRenderedState.frameIndex
            };
        }

        const actionCountData = [];
        
        for (let i = stateCrop.start; i < stateCrop.end; i++) {
            actionCountData.push({
                colors: this.engine.rollback.stateBuffer[i].actions.map(a => Graphics.colorFromText(a.context + a.ownerId.repeat(4))),
                values: this.engine.rollback.stateBuffer[i].actions.map(_ => 1)
            });
        }

        const stateBufferData = [];
        for (let i = stateCrop.start; i < stateCrop.end; i++) {
            stateBufferData.push({
                colors: [this.engine.rollback.stateBuffer[i].onlyActions ? "dodgerblue" : "orangered"],
                values: [this.engine.rollback.stateBuffer[i].actions.length + 1]
            });
        }

        this.actionCountGraph.data = actionCountData;

        this.stateBufferType.data = stateBufferData;

        this.rollBackGraph.data = this.rollbackCountPerFrame;
        this.rollBackGraph.crop = rollbackCrop;

        this.renderTimeGraph.data = this.renderTimeHistory;
        this.renderTimeGraph.crop = Graphics.cropEnd(this.renderTimeHistory.length, 60 * 5);

        this.tickTimeGraph.data = this.tickTimeHistory;
        this.tickTimeGraph.crop = Graphics.cropEnd(this.tickTimeHistory.length, 60 * 5);
        this.lagOverTimeGraph.data = this.lagHistory;
        this.lagOverTimeGraph.crop = Graphics.cropEnd(this.lagHistory.length, 60 * 5);
        this.tickCountGraph.data = this.updateCountHistory;
        this.tickCountGraph.crop = Graphics.cropEnd(this.updateCountHistory.length, 60 * 5);

        switch (this.debugLevel) {
            case DebugMode.ALL_GRAPHS:
                this.drawGraphGrid(0, 0, 1.5, 1, ctx, canvas, this.actionCountGraph);
                this.drawGraphGrid(1, 0, 1.5, 1, ctx, canvas, this.rollBackGraph);
                this.drawGraphGrid(2, 2, 3, 1, ctx, canvas, this.renderTimeGraph);
                this.drawGraphGrid(3, 2, 3, 1, ctx, canvas, this.tickTimeGraph);
                this.drawGraphGrid(2, 0, 1.5, 1, ctx, canvas, this.stateBufferType);
                this.drawGraphGrid(1, 2, 3, 1, ctx, canvas, this.lagOverTimeGraph);
                this.drawGraphGrid(0, 2, 3, 1, ctx, canvas, this.tickCountGraph);
                break;
            case DebugMode.ROLLBACK_SIMPLE:
                this.drawGraphGrid(0, 0, 1, 1, ctx, canvas, this.actionCountGraph);
                this.drawGraphGrid(1, 0, 1, 1, ctx, canvas, this.rollBackGraph);
                break;
            case DebugMode.ROLLBACK:
                this.drawGraphGrid(0, 0, 1, 1, ctx, canvas, this.actionCountGraph);
                this.drawGraphGrid(1, 0, 1, 1, ctx, canvas, this.rollBackGraph);
                this.drawGraphGrid(2, 0, 1, 1, ctx, canvas, this.stateBufferType);
                break;
        }
    }
}