import { Engine } from "engine.js";
import { State } from "frame-state.js";

export class Rollback {
    stateBuffer: State[] = [];
    readonly FULL_SNAPSHOT_EVERY_FRAME_COUNT = 60;

    constructor(private engine: Engine) { }

    saveStateToBuffer(state: State) {
        if (state.frameIndex % this.FULL_SNAPSHOT_EVERY_FRAME_COUNT === 0) {
            this.stateBuffer.push(state.clone());
        } else {
            this.stateBuffer.push(state.cloneActions());
        }
    }

    fixStateBuffer() {

    }

    recomputeStateSinceFrame(index: number) {
        if (index > this.stateBuffer.length) {
            console.warn("Attempting to rollback in the future");
        }

        // Find full snapshot
        let fullSnapshot = this.stateBuffer[index];
        while (fullSnapshot.onlyActions) {
            fullSnapshot = this.stateBuffer[--index];
        }

        // Load full snapshot
        const restoredState = fullSnapshot.clone();

        // Apply tick until buffer is empty
        for (let i = index; i < this.stateBuffer.length; i++) {
            this.setActionsFromBuffer(restoredState, i);
            this.engine.tick(restoredState);
        }

        return restoredState;
    }

    setActionsFromBuffer(state: State, index: number) {
        const savedState = this.stateBuffer[index];
        state.actions = savedState.actions;
        state.actionContext = savedState.actionContext;
        state.frameIndex = savedState.frameIndex;
    }

}