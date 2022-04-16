export type Actions = {
    ofPlayer(ownerId: number): { [key: string]: Action }
    byType(context: string, type: string): Action[]
    setContext(context: string): void
    local: { [key: string]: Action }
}

export type Action = {
    type: string,
    ownerId: number,
    context: string,
    data?: unknown
}