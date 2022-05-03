export abstract class NetworkAdapterInterface {
    constructor(
        public requestStateHandler: () => string,
        public eventHandler: (actions: string[], context: string, playerId: string, frameIndex: number) => void
    ) { }

    /**
     * Query the server to get the latest state from the "host"
     */
    abstract getLatestState(): Promise<string | null>

    /**
     * Connect to the server, should received a playerId once connected
     * @param ip 
     * @param port 
     */
    abstract connect(ip: string, port: number): Promise<{
        playerId: string
    }>

    /**
     * Send an action to all *others* players
     * @param action 
     * @param context 
     * @param frameIndex 
     */
    abstract broadcastAction(actions: string[], context: string, frameIndex: number): void
}