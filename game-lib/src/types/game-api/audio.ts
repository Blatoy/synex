export type Audio = {
    muted: boolean
    play: (audioPath: string) => Promise<void>
    playOnce: (audioPath: string) => Promise<void>
    stop: (audioPath: string) => void
    enableAudio: () => void
}