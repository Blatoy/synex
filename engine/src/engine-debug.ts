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
        let debugYPos = 0;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "32px monospace";
        ctx.fillText("= " + this.engine.name + " =", 10, debugYPos += 30);
        ctx.fillText("frame: " + state.frameIndex, 10, debugYPos += 30);
        ctx.fillText("tick: " + this.lastTickTime.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("rend: " + this.lastRenderTime.toFixed(2) + "ms", 10, debugYPos += 30);
        ctx.fillText("lag : " + this.engine.updateLag.toFixed(2) + "ms " + (this.engine.updateLag > this.engine.msPerFrame ? " (can't keep up!)" : ""), 10, debugYPos += 30);
        ctx.restore();
    }
}