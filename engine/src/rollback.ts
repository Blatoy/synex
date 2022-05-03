import { Engine } from "engine.js";
import { State } from "frame-state.js";
import { Action } from "game-lib/types/game-api/action.js";

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

    onLateJoin(state: State) {
        this.stateBuffer = [];
        for (let i = 0; i < state.frameIndex - 1; i++) {
            this.stateBuffer.push(state.cloneActions()); // -1 => cannot rollback
        }
        this.stateBuffer.push(state.clone());
    }

    // TODO: This WILL go wrong if multiple actions share the same type and context but
    // different data at the same frame
    private actionsEqual(action1: Action, action2: Action) {
        return action1.context === action2.context && action1.type === action2.type;
    }

    predictedStateBufferMatchActual(predictedPlayerActions: Action[], receivedActions: Action[]) {
        if (receivedActions.length !== predictedPlayerActions.length) {
            return false;
        }

        // Were all received actions predicted?
        if (!receivedActions.every(newAction =>
            predictedPlayerActions.every(predictedAction =>
                this.actionsEqual(newAction, predictedAction)
            )
        )) {
            return false;
        }

        // Is any prediction wrong?
        if (!predictedPlayerActions.every(predictedAction =>
            receivedActions.some(newAction =>
                this.actionsEqual(newAction, predictedAction)
            )
        )) {
            return false;
        }

        return true;
    }

    // TODO: this should work with a full frame
    // e.g: P1 sends [a, b], frame buffer had [a, b, c] => mismatch! => fix
    updateStateBuffer(frameIndex: number, playerId: string, receivedActions: Action[]): boolean {
        if (frameIndex < this.stateBuffer.length) {
            const predictedActions = this.stateBuffer[frameIndex].actions;
            const playerActions = predictedActions.filter(action => action.ownerId === playerId);
            if (!this.predictedStateBufferMatchActual(playerActions, receivedActions)) {
                // mismatch => remove all actions from other players
                this.stateBuffer[frameIndex].actions = predictedActions.filter(
                    action => action.ownerId !== playerId
                );

                // add all actions from other player
                // TODO: Should this be on a per-player basis?
                // This seems like it would go wrong with more than 2 players
                for (const actualAction of receivedActions) {
                    this.stateBuffer[frameIndex].actions.push(actualAction);
                }

                return true;
            }
        }

        return false;
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

        // Clear full states
        // TODO: This should still recreate new frames every x
        // Otherwise, if there is always a misprediction, it will never
        // manage to save another frame
        for (let i = index + 1; i < this.stateBuffer.length; i++) {
            this.stateBuffer[i].onlyActions = true;
            this.stateBuffer[i].entities = [];
        }

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