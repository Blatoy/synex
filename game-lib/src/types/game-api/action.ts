export type Actions = {
    /**
     * @param ownerId network id of a player (received on scene load)
     * @returns List of actions for specified id
     */
    ofPlayer(ownerId: string): { [key: string]: Action }

    /**
     * @param context 
     * @param type 
     * @returns List of actions for specified context and frame
     */
    byType(context: string, type: string): Action[]

    /**
     * Update current input context
     * Changing context allows to easily support menus and other
     * @param context 
     */
    setContext(context: string): void

    /**
     * @returns Current context. Should not be needed other than for debugging
     */
    getContext(): string
    
    /**
     * Send action to everyone. Must ONLY be triggered in reaction to an unsync action
     * Can be sent manually! Must check that it can still be triggered when received
     * Value must be JSON serializable
     */
    broadcast(type: string, value?: unknown): void;
    
    /**
     * @returns List of actions of local player
     */
    ofLocalPlayer(): { [key: string]: Action }
}

export type Action = {
    /**
     * action type, defined in game metadata
     */
    type: string
    /**
     * Network id of a plyer
     */
    ownerId: string
    /**
     * Context of the action, defined in game metadata
     */
    context: string
    /**
     * Optional data. 
     */
    data?: unknown
}