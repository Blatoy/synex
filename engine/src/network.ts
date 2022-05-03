import { Engine } from "engine.js";
import { Action } from "game-lib/types/game-api/action.js";
import { LocalAdapter } from "network-adapters/local/local-adapter.js";
import { WSAdapter } from "network-adapters/ws-server/ws-adapter.js";
import { NetworkAdapterInterface } from "network-adapters/network-interface.js";

type ActionQueue = Map<number, Record<string, Action[]>>;

export class Network {
    private adapter: NetworkAdapterInterface;
    private _localId = "-1";

    private _actionQueue: ActionQueue = new Map();

    constructor(private engine: Engine) {
        this.adapter = new WSAdapter(
            this.onRequestState.bind(this),
            this.onEventsReceived.bind(this)
        );
    }

    async connect(ip: string, port: number) {
        const connectionData = await this.adapter.connect(ip, port);
        // TODO: Handle failure
        this._localId = connectionData.playerId;
    }

    async getLatestState() {
        return await this.adapter.getLatestState();
    }

    onSceneLoaded(frameIndex: number) {
        this.sendToAll(["sceneLoaded"], "network", frameIndex);
    }

    public get localId() {
        return this._localId;
    }

    public get actionQueue(): ActionQueue {
        return this._actionQueue;
    }

    private onRequestState(): string {
        return this.engine.serializeState();
    }

    private onEventsReceived(actions: string[], context: string, playerId: string, frameIndex: number): void {
        if (!this._actionQueue.has(frameIndex)) {
            this._actionQueue.set(frameIndex, {});
        }

        const queueForIndex = this._actionQueue.get(frameIndex);
        if (queueForIndex) {
            if (!queueForIndex[playerId]) {
                queueForIndex[playerId] = [];
            }

            for (let i = 0; i < actions.length; i++) {
                this._actionQueue.get(frameIndex)?.[playerId].push({
                    type: actions[i],
                    ownerId: playerId,
                    context: context
                });
            }

    }

    sendToAll(actions: string[], context: string, frameIndex: number) {
        // TODO: this is a hack as otherwise loadScene is called too early and ignored
        // this is probably an issue that should be fixed
        if (context === "network") {
            this.onEventsReceived(actions, context, this.localId, frameIndex);
        } else {
            for (let i = 0; i < actions.length; i++) {
                this.engine.currentState.actions.push({
                    ownerId: this.localId,
                    type: actions[i],
                    context: context
                });
            }
        }
        this.adapter.broadcastAction(actions, context, frameIndex);
    }
}