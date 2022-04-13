export type Actions = {
    ofPlayer(ownerId: number): { [key: string]: Action }
    byType(type: string): Action[]
    setContext(context: string): void
    local: { [key: string]: Action }
}

export type Action = {
    type: string,
    ownerId: number,
    data?: unknown
}