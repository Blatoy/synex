import { Engine } from "engine.js";
import { Action } from "game-lib/types/game-api/action.js";
import { LocalAdapter } from "network-adapters/local/local-adapter.js";
import { WSAdapter } from "network-adapters/ws-server/ws-adapter.js";
import { NetworkAdapterInterface } from "network-adapters/network-interface.js";

// frameIndex => {playerId, actions}
type ActionQueue = Map<number, Record<string, Action[]>>;
// playerId => {frameIndex, actions}
type Predictions = Record<string, { lastFrameIndex: number, actions: Action[] }>;

export type NetworkAction = { type: string, data?: unknown } | string;

export class Network {
    private adapter: NetworkAdapterInterface;
    private _localId = "-1";

    // TODO: clear action/input confusion naming
    private manualActionQueue: { type: string, data: unknown }[] = [];
    private _actionQueue: ActionQueue = new Map();
    private _predictions: Predictions = {};
    public packetSentThisFrame = false;
    public ignoreEventBroadcast = false;

    constructor(private engine: Engine) {
        this.adapter = new LocalAdapter(
            this.onRequestFrameIndex.bind(this),
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
        // This line is important
        // Sending to all *does* append to the action buffer
        // But since onSceneLoaded is called before the game loop
        // The action buffer is cleared instantly
        // This ensures the join event is handled locally on the next frame too
        this.onEventsReceived(["sceneLoaded"], "network", this.localId, frameIndex);
        this.sendToAll(["sceneLoaded"], [], "network", frameIndex);
    }

    addManualAction(type: string, data: unknown) {
        if (!this.ignoreEventBroadcast) {
            this.manualActionQueue.push({ type, data });
        }
    }

    public get localId() {
        return this._localId;
    }

    public get actionQueue(): ActionQueue {
        return this._actionQueue;
    }

    public get predictions(): Predictions {
        return this._predictions;
    }

    private onRequestState(): string {
        return this.engine.serializeState();
    }

    // TODO: this should be tracked service side
    private onRequestFrameIndex(): number {
        return this.engine.currentState.frameIndex;
    }

    private onEventsReceived(actions: NetworkAction[], context: string, playerId: string, frameIndex: number): void {
        if (!this._actionQueue.has(frameIndex)) {
            this._actionQueue.set(frameIndex, {});
        }

        if (!this._predictions[playerId]) {
            this._predictions[playerId] = { actions: [], lastFrameIndex: 0 };
        }

        const playerPredictions = this._predictions[playerId];
        const queueForIndex = this._actionQueue.get(frameIndex);
        if (queueForIndex) {
            if (!queueForIndex[playerId]) {
                queueForIndex[playerId] = [];
            }

            for (let i = 0; i < actions.length; i++) {
                let action = actions[i];
                if (typeof action === "string") {
                    action = {
                        type: action
                    };
                }

                this._actionQueue.get(frameIndex)?.[playerId].push({
                    type: action.type,
                    data: action.data,
                    ownerId: playerId,
                    context: context
                });
            }

            if (frameIndex > playerPredictions.lastFrameIndex) {
                playerPredictions.actions = queueForIndex[playerId];
                playerPredictions.lastFrameIndex = frameIndex;
            }
        }
    }

    sendToAll(actions: NetworkAction[], localActions: NetworkAction[], context: string, frameIndex: number) {
        if (this.packetSentThisFrame) {
            console.warn("Cannot use sendToAll twice per frame");
            return;
        }

        this.packetSentThisFrame = true;

        for (const event of this.manualActionQueue) {
            actions.push({
                type: event.type,
                data: event.data
            });
        }

        this.manualActionQueue = [];

        // TODO: Cleanup these 2 for as they are almost the same
        // actions sent to other players
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];
            if (typeof action === "string") {
                action = {
                    type: action
                };
            }

            this.engine.currentState.actions.push({
                ownerId: this.localId,
                type: action.type,
                data: action.data,
                context: context
            });
        }

        // actions not sent to other players
        for (let i = 0; i < localActions.length; i++) {
            let action = localActions[i];
            if (typeof action === "string") {
                action = {
                    type: action
                };
            }

            this.engine.currentState.actions.push({
                ownerId: this.localId,
                type: action.type,
                data: action.data,
                context: context
            });
        }
        this.adapter.broadcastAction(actions, context, frameIndex);
    }
}