import { State } from "./frame-state.js";
import { Engine } from "engine.js";


export class EngineDebugger {
    private _pauseLoop = false;
    private _stepByStep = false;
    private _breakFrames: number[] = [];

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
        this._stepByStep = false;
    }

    addBreakFrame(index: number) {
        this._breakFrames.push(index);
    }

    step() {
        this._stepByStep = true;
        this._pauseLoop = false;
    }

    get pauseLoop() {
        return this._pauseLoop;
    }

    onTickStart(state: State) {
        if (this._breakFrames.includes(state.frameIndex)) {
            this._pauseLoop = true;
        }

        this.timers.tickStart = performance.now();

        return this._pauseLoop;
    }

    onTickEnd() {
        this.times.lastTick = performance.now() - this.timers.tickStart;

        if (this._stepByStep) {
            this._stepByStep = false;
            this._pauseLoop = true;
        }
    }

    onRenderStart() {
        this.timers.renderStart = performance.now();
    }

    onRenderEnd() {
        this.times.lastRender = performance.now() - this.timers.renderStart;
    }

    renderDebug(ctx: CanvasRenderingContext2D, state: State) {
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

        this.renderTimeline(ctx, this.engine.rollback.stateBuffer.map(s => {
            return { color: s.actionContext === "default" ? "dodgerblue" : "orange", height: 0.02 + s.actions.length / 5 };
        }), {
            title: "Actions count and context in frame buffer",
            width: w, top: h - 130, height: 130,
            ...this.getLiveDisplayOffsets(this.engine.rollback.stateBuffer.length, 60 * 5, this.engine.rollback.replayIndex),
            highlightedIndex: this.engine.currentState.frameIndex
        });

        this.renderTimeline(ctx, this.engine.rollback.stateBuffer.map(s => {
            return { color: s.entities.length > 0 ? "orange" : "dodgerblue", height: s.entities.length > 0 ? 1 : 0.5 };
        }), {
            title: "Snapshot vs actions in frame buffer",
            width: w, top: h - 185, height: 50,
            ...this.getLiveDisplayOffsets(this.engine.rollback.stateBuffer.length, 60 * 5, this.engine.rollback.replayIndex),
            highlightedIndex: this.engine.currentState.frameIndex
        });

        ctx.restore();
    }

    getLiveDisplayOffsets(total: number, count: number, seek = -1) {
        if (seek === -1) {
            return { start: Math.max(total - count, 0), end: total };
        } else {
            const start = Math.max(0, seek - count / 2);
            const end = Math.min(total, start + count);
            return { start: Math.max(0, end - count), end: Math.min(end, total) };
        }
    }

    renderTimeline(ctx: CanvasRenderingContext2D, data: { height: number, color: string }[], {
        title = "Untitled timeline",
        left = 0, top = 0, height = 100, width = 1000,
        start = 0, end = 1000,
        highlightedIndex = -1,
        offsetLabel = ""
    }) {
        const topYOffset = 30;
        end = Math.min(data.length, end);
        const count = end - start;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(left, top, width, height);
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "22px monospace";
        ctx.fillText(title, left + width / 2, top + 20);
        ctx.textAlign = "left";
        ctx.fillText(start.toString(), left + 10, top + 20);
        ctx.textAlign = "right";
        ctx.fillText(end + (data.length === end ? "" : ` / ${data.length}`) + " " + offsetLabel, left + width - 10, top + 20);

        for (let i = start; i < end; i++) {
            const x = 5 + (width - 5) * ((i - start) / count);
            const y = top + topYOffset;
            ctx.fillStyle = data[i].color;
            ctx.fillRect(x, y, 2, data[i].height * (height - topYOffset));
            if (i === highlightedIndex) {
                ctx.strokeStyle = "gold";
                ctx.strokeRect(x - 2, y - 2, 6, data[i].height * (height - topYOffset) + 4);
            }
        }
    }
}