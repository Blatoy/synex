export type Actions = {
    ofPlayer(ownerId: string): { [key: string]: Action }
    byType(context: string, type: string): Action[]
    setContext(context: string): void
    broadcast(type: string, value?: unknown): void;
    ofLocalPlayer(): { [key: string]: Action }
}

export type Action = {
    type: string,
    ownerId: string,
    context: string,
    data?: unknown
}