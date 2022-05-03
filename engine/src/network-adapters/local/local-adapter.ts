import { NetworkAdapterInterface } from "network-adapters/network-interface.js";

let playerCount = 0;
const clientsAdapters: LocalAdapter[] = [];

// A similar class to this one should connect to a server and handle all messages and stuff 
// This class is instantiated once for each engine 
export class LocalAdapter extends NetworkAdapterInterface {
    private isHost = false;
    public playerId = -1;
    public jitter = 0;
    public lag = 0;

    constructor(
        requestStateHandler: () => string,
        eventHandler: (action: string[], context: string, playerId: string, frameIndex: number) => void) {

        super(requestFrameIndexHandler, requestStateHandler, eventHandler);
        this.playerId = playerCount++;
    }

    getLatestState(): Promise<string | null> {
        if (!this.isHost) {
            return Promise.resolve(clientsAdapters[0].requestStateHandler());
        } else {
            return Promise.resolve(null);
        }
    }

    broadcastAction(action: string[], context: string, frameIndex: number) {
        for (const client of this.otherClients) {
            if (this.jitter === 0 && this.lag === 0) {
                client.eventHandler(action, context, this.playerId.toString(), frameIndex);
            } else {
                setTimeout(() => {
                    setTimeout(() => {
                        client.eventHandler(action, context, this.playerId.toString(), frameIndex);
                    }, this.lag);
                }, Math.random() * this.jitter);
            }
        }
    }

    connect(ip: string, port: number): Promise<{ playerId: string; }> {
        clientsAdapters.push(this);

        if (this.playerId === 0) {
            this.isHost = true;
        }

        return Promise.resolve(
            {
                playerId: this.playerId.toString()
            }
        );
    }

    private get otherClients() {
        return clientsAdapters.filter(client => client.playerId !== this.playerId);
    }
}