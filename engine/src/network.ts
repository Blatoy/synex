import { Engine } from "engine.js";
import { Action } from "game-lib/types/game-api/action.js";
import { LocalAdapter } from "network-adapters/local/local-adapter.js";
import { NetworkAdapterInterface } from "network-adapters/network-interface.js";

type ActionQueue = Map<number, Record<string, Action[]>>;

export class Network {
    private adapter: NetworkAdapterInterface;
    private _localId = "-1";

    private _actionQueue: ActionQueue = new Map();

    constructor(private engine: Engine) {
        this.adapter = new LocalAdapter(
            this.onRequestState.bind(this),
            this.onEventReceived.bind(this)
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
        this.sendToAll("sceneLoaded", "network", frameIndex);
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

    private onEventReceived(action: string, context: string, playerId: string, frameIndex: number): void {
        if (!this._actionQueue.has(frameIndex)) {
            this._actionQueue.set(frameIndex, {});
        }

        const queueForIndex = this._actionQueue.get(frameIndex);
        if (queueForIndex) {
            if (!queueForIndex[playerId]) {
                queueForIndex[playerId] = [];
            }

            this._actionQueue.get(frameIndex)?.[playerId].push({
                type: action,
                ownerId: playerId,
                context: context
            });
        }

    }

    sendToAll(action: string, context: string, frameIndex: number) {
        // TODO: this is a hack as otherwise loadScene is called too early and ignored
        // this is probably an issue that should be fixed
        if (context === "network") {
            this.onEventReceived(action, context, this.localId, frameIndex);
        } else {
            this.engine.currentState.actions.push({
                ownerId: this.localId,
                type: action,
                context: context
            });
        }
        this.adapter.broadcastAction(action, context, frameIndex);
    }
}