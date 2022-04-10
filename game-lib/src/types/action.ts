export type Actions = {
    ofPlayer(ownerId: number): { [key: string]: Action }
    byType(type: string): Action[]
    setContext(type: string): void
    local: { [key: string]: Action }
}

export type Action = {
    name: string,
    ownerId: number,
    data: unknown
}