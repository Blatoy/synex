import { NetworkAdapterInterface } from "network-adapters/network-interface.js";
import { NetworkAction } from "network.js";


// A similar class to this one should connect to a server and handle all messages and stuff 
// This class is instantiated once for each engine 
export class WSAdapter extends NetworkAdapterInterface {
    socket?: WebSocket;
    onIdReceived?: Promise<{ playerId: string; }>;

    constructor(
        requestFrameIndexHandler: () => number,
        requestStateHandler: () => Promise<string>,
        eventHandler: (actions: NetworkAction[], context: string, playerId: string, frameIndex: number) => void) {
        super(requestFrameIndexHandler, requestStateHandler, eventHandler);
        // TODO: Add timeout server side to avoid player never disconnecting
        window.addEventListener("beforeunload", () => {
            this.socket?.send(JSON.stringify({
                type: "disconnect"
            }));
        });
    }

    getLatestState(): Promise<string | null> {
        this.socket?.send(JSON.stringify({
            type: "query-latest-state"
        }));

        return new Promise((resolve) => {
            this.socket?.addEventListener("message", function handler(message) {
                try {
                    // TODO: Better typing, no try catch and copy pasted everything
                    const data = JSON.parse(message.data) as { type: string, data: string };
                    if (data.type === "latest-state") {
                        if (data.data === "") {
                            resolve(null);
                        } else {
                            resolve(data.data);
                        }
                        this.removeEventListener("message", handler);
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        });
    }

    broadcastAction(actions: string[], context: string, frameIndex: number) {
        this.socket?.send(JSON.stringify({
            type: "action",
            data: { actions, context, frameIndex } // TODO: Use types that are also used by the server
        }));
    }

    connect(ip: string, port: number): Promise<{ playerId: string; }> {
        this.socket = new WebSocket(`ws://${ip}:${port}`);

        this.socket.addEventListener("message", this.handleMessage.bind(this));

        return new Promise((resolve) => {
            this.socket?.addEventListener("message", function (ev) {
                resolve({
                    playerId: ev.data
                });
            }, { once: true });
        });
    }

    private async handleMessage(message: MessageEvent<string>) {
        try {
            const data = JSON.parse(message.data) as { type: string, data: unknown };
            switch (data.type) {
                case "disconnect": {
                    // TODO: Force managing disconnecting?
                    const d = data.data as { playerId: string, frameIndex: number };
                    this.eventHandler(["disconnect"], "network", d.playerId, d.frameIndex);
                } break;
                case "query-latest-state":
                    this.socket?.send(JSON.stringify({
                        type: "latest-state",
                        data: await this.requestStateHandler()
                    }));
                    break;
                case "query-frame-index":
                    this.socket?.send(JSON.stringify({
                        type: "frame-index",
                        data: this.requestFrameIndexHandler()
                    }));
                    break;
                case "action": {
                    const d = data.data as { actions: string[], context: string, frameIndex: number, playerId: string };
                    this.eventHandler(d.actions, d.context, d.playerId, d.frameIndex);

                } break;
            }
        } catch (e) {
            console.log(e);
        }
    }
}