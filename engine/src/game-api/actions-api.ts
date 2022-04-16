import { State } from "frame-state.js";
import { Action, Actions } from "game-lib/types/game-api/action.js";

export class ActionsAPI implements Actions {
    constructor(private state: State) { }

    ofPlayer(ownerId: number): { [key: string]: Action; } {
        const actions: { [key: string]: Action; } = {};
        for (const action of this.state.actions) {
            if (action.ownerId === ownerId) {
                actions[`${action.context}:${action.type}`] = action;
            }
        }
        return actions;
    }

    /**
     * @param context 
     * @param type 
     * @returns List of actions for specified context and frame
     */
    byType(context: string, type: string): Action[] {
        return this.state.actions.filter(action => (action.type === type && action.context === context));
    }

    setContext(context: string): void {
        this.state.actionContext = context;
    }

    get local() {
        return {};
    }

}