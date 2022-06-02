export type Audio = {
    /**
     * Muted audio
     */
    muted: boolean
    /**
     * Play a song in a loop
     */
    play: (audioPath: string) => Promise<void>
    /**
     * Play a sound effect once
     */
    playOnce: (audioPath: string) => Promise<void>
    /**
     * Stop playing audio
     */
    stop: (audioPath: string) => void
    /**
     * Must be triggered once when the user interacts with the page
     */
    enableAudio: () => void
}