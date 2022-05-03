import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 43222 });

const clients: { ws: WebSocket, id: string }[] = [];
const clientsWaitingForState: WebSocket[] = [];

let playerLastId = 0;
let latestFrameIndex = 0;

console.log("Server started, listening on", 43222);

function sendToClient(client: WebSocket, type: string, data: unknown) {
    client.send(JSON.stringify({
        type: type,
        data: data
    }));
}

// Used for disconnection
// In a real case it should probably compute it correctly here
setInterval(() => {
    if (clients.length > 0) {
        sendToClient(clients[0].ws, "query-frame-index", undefined);
    }
}, 100);


function onDisconnect(ws: WebSocket, playerId: string) {
    for (let i = 0; i < clients.length; i++) {
        if (ws === clients[i].ws) {
            clients.splice(i, 1);
            return;
        }
    }

    console.log("Player disconnected", playerId);

    for (const client of clients) {
        sendToClient(client.ws, "disconnect", { playerId: playerId, frameIndex: latestFrameIndex });
    }
}

wss.on("connection", function connection(ws) {
    const playerId = (++playerLastId).toString();

    // Register new client
    clients.push({ ws: ws, id: playerId });
    // Update player id
    ws.send(playerId);

    console.log("Player joined", playerId);

    ws.on("close", () => {
        onDisconnect(ws, playerId);
    });
    ws.on("error", () => {
        onDisconnect(ws, playerId);
    });

    ws.on("message", function message(data) {
        const d = JSON.parse(data.toString()) as { type: string, data: unknown };
        switch (d.type) {
            case "frame-index":
                latestFrameIndex = d.data as number;
                break;
            case "disconnect":
                onDisconnect(ws, playerId);
                break;
            case "latest-state":
                for (const client of clientsWaitingForState) {
                    sendToClient(client, "latest-state", d.data);
                }
                break;
            case "query-latest-state":
                if (clients.length === 1) {
                    sendToClient(ws, "latest-state", "");
                } else {
                    clientsWaitingForState.push(ws);
                    sendToClient(clients[0].ws, "query-latest-state", undefined);
                }
                break;
            case "action": {
                const otherClients = clients.filter(client => client.id !== playerId);
                (d.data as { playerId: string }).playerId = playerId; // TODO: Use shared type with adapter...
                for (const client of otherClients) {
                    client.ws.send(JSON.stringify(d));
                }
            } break;
        }
    });
});
