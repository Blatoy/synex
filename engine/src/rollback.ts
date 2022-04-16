import { State } from "frame-state.js";

export class Rollback {
    stateBuffer: State[] = [];
    readonly FULL_SNAPSHOT_EVERY_FRAME_COUNT = 60;


    replayIndex = -1;

    saveStateToBuffer(state: State) {
        if (state.frameIndex % this.FULL_SNAPSHOT_EVERY_FRAME_COUNT === 0) {
            this.stateBuffer.push(state.clone());
        } else {
            this.stateBuffer.push(state.cloneActions());
        }
    }

    /* setActionsFromReplay() {
         if (this.replayIndex >= this.stateBuffer.length) {
             this.replayIndex = -1;
             return;
         }
 
         const savedState = this.stateBuffer[this.replayIndex++];
         if (savedState.entities.length > 0) {
             this.currentState = savedState.clone(this.gameTemplate);
         } else {
             this.currentState.actions = savedState.actions;
             this.currentState.actionContext = savedState.actionContext;
             this.currentState.frameIndex = savedState.frameIndex;
         }
     } */

}