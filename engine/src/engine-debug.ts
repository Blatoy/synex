import { State } from "./frame-state.js";
import { Engine } from "engine.js";


export class EngineDebugger {
    pauseUpdate = false;
    lastTickTime = 0;
    lastRenderTime = 0;
    currentSkipCount = 0;
    skipRenderFrames = 0;
    pauseGameFrameIndex = -1;

    timers = {
        tickStart: 0,
        renderStart: 0
    };

    constructor(private engine: Engine) {

    }

    get cancelTick() {
        return this.pauseUpdate;
    }


    onTickStart(state: State) {
        if (state.frameIndex === this.pauseGameFrameIndex) {
            this.pauseUpdate = true;
        }

        this.timers.tickStart = performance.now();

        return this.pauseUpdate;
    }

    onTickEnd() {
        this.lastTickTime = performance.now() - this.timers.tickStart;
    }

    onRenderStart() {
        this.timers.renderStart = performance.now();
    }

    onRenderEnd() {
        this.lastRenderTime = performance.now() - this.timers.renderStart;
    }

    onGameLoopStart() {
        if (!this.pauseUpdate && this.currentSkipCount++ > this.skipRenderFrames) {
            this.currentSkipCount = 0;
        }
    }

    renderDebug(ctx: CanvasRenderingContext2D, state: State) {
        const h = this.engine.gameCanvas.canvas.height;
        const w = this.engine.gameCanvas.canvas.width;

        let debugYPos = 0;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "32px monospace";
        ctx.fillText("= " + this.engine.name + " =", 10, debugYPos += 30);
        ctx.fillText("frame: " + state.frameIndex + (this.engine.replayIndex > -1 ? " (replaying)" : ""), 10, debugYPos += 30);
        ctx.fillText("tick : " + this.lastTickTime.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("rend : " + this.lastRenderTime.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("lag  : " + this.engine.updateLag.toFixed(2) + "ms " + (this.engine.updateLag > this.engine.msPerFrame ? " (can't keep up!)" : ""), 10, debugYPos += 30);
        ctx.fillText("ctx  : " + this.engine.currentState.actionContext, 10, debugYPos += 30);
        ctx.fillText("acts : " + this.engine.currentState.actions.map(a => `${a.ownerId}:${a.type}`).join(", "), 10, debugYPos += 30);

        this.renderTimeline(ctx, this.engine.stateBuffer.map(s => {
            return { color: s.actionContext === "default" ? "dodgerblue" : "orange", height: 0.02 + s.actions.length / 5 };
        }), {
            title: "Actions count and context in frame buffer",
            width: w, top: h - 130, height: 130,
            ...this.getLiveDisplayOffsets(this.engine.stateBuffer.length, 60 * 5, this.engine.replayIndex),
            highlightedIndex: this.engine.currentState.frameIndex
        });

        this.renderTimeline(ctx, this.engine.stateBuffer.map(s => {
            return { color: s.entities.length > 0 ? "orange" : "dodgerblue", height: s.entities.length > 0 ? 1 : 0.5 };
        }), {
            title: "Snapshot vs actions in frame buffer",
            width: w, top: h - 185, height: 50,
            ...this.getLiveDisplayOffsets(this.engine.stateBuffer.length, 60 * 5, this.engine.replayIndex),
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