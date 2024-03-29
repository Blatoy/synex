import { Engine } from "engine/engine.js";
import { GameTemplate } from "engine/game-template.js";
import { LocalAdapter } from "engine/network-adapters/local/local-adapter.js";
import { WSAdapter } from "engine/network-adapters/ws-server/ws-adapter.js";

const engines: Engine[] = [];
const gameTemplate = new GameTemplate("/scripts/games/magnet-bros");

// Expose engines globally for this demo
declare global {
    interface Window { synex: { engines: Engine[] } }
}

window.synex = { engines: [] };

window.addEventListener("load", async () => {

    await gameTemplate.load();

    engines.push(new Engine("Engine 1", gameTemplate, document.getElementById("game-1") as HTMLDivElement));
    engines.push(new Engine("Engine 2", gameTemplate, document.getElementById("game-2") as HTMLDivElement));

    engines[1].inputs.ignoreInputs = true;

    engines.forEach((engine) => {
        engine.gameCanvas.canvas.addEventListener("click", () => {
            engines.forEach((e) => {
                if (e !== engine) {
                    e.inputs.ignoreInputs = true;
                    e.gameCanvas.canvas.classList.remove("selected");
                } else {
                    e.gameCanvas.canvas.classList.add("selected");
                }
            });
            engine.inputs.ignoreInputs = false;
        });
    });

    engines[0].start();
    engines[0].gameCanvas.canvas.classList.add("selected");
    setTimeout(() => {
        engines[1].start();
    }, 100);

    window.synex.engines = engines;
    engines[0].debugger.debugLevel = 1;
    engines[1].debugger.debugLevel = 1;

    addDebugElements("debug-game-1", engines[0]);
    addDebugElements("debug-game-2", engines[1]);

    const disablePrediction = document.querySelector("#target-ups") as HTMLInputElement;
    disablePrediction.value = engines[0].targetUPS.toString();
    disablePrediction.addEventListener("input", () => {
        for (const engine of engines) {
            engine.setTargetUPS(parseFloat(disablePrediction.value));
        }
    });
    
    const liveReloadButton = document.querySelector("#live-reload") as HTMLInputElement;
    liveReloadButton.addEventListener("click", () => {
        liveReload();
    });
});

function addDebugElements(targetName: string, engine: Engine) {
    const debugTemplate = document.getElementById("debug-template") as HTMLTemplateElement;
    const debug = debugTemplate.content.cloneNode(true) as HTMLDivElement;

    const debugLevelSelect = debug.querySelector(".select-label") as HTMLSelectElement;
    const disablePrediction = debug.querySelector(".no-prediction") as HTMLInputElement;
    const presetDetails = debug.querySelector(".preset-details") as HTMLInputElement;
    const presetDefault = debug.querySelector(".preset-default") as HTMLInputElement;

    const localAdapter = debug.querySelector(".local-adapter") as HTMLElement;
    const jitterInput = debug.querySelector(".jitter-input") as HTMLInputElement;
    const lagInput = debug.querySelector(".lag-input") as HTMLInputElement;
    const graphFrames = debug.querySelector(".graph-frames") as HTMLInputElement;

    const wsAdapter = debug.querySelector(".ws-adapter") as HTMLElement;
    const wsAdapterStatus = debug.querySelector(".ws-adapter-status") as HTMLInputElement;

    graphFrames.addEventListener("input", () => {
        engine.debugger.graphFrameCount = parseInt(graphFrames.value);
    });

    presetDetails.addEventListener("click", () => {
        graphFrames.value = "10";
        debugLevelSelect.selectedIndex = 4;
        debugLevelSelect.dispatchEvent(new Event("change"));
        graphFrames.dispatchEvent(new Event("input"));
    });
    presetDefault.addEventListener("click", () => {
        graphFrames.value = "180";
        debugLevelSelect.selectedIndex = 1;
        debugLevelSelect.dispatchEvent(new Event("change"));
        graphFrames.dispatchEvent(new Event("input"));
    });

    if (engine.network.adapter instanceof LocalAdapter) {
        wsAdapter.classList.add("hidden");

        const adapter = engine.network.adapter;
        jitterInput.addEventListener("input", () => {
            adapter.jitter = parseInt(jitterInput.value);
        });
        lagInput.addEventListener("input", () => {
            adapter.lag = parseInt(lagInput.value);
        });
        // engine.network.adapter;
    } else if (engine.network.adapter instanceof WSAdapter) {
        localAdapter.classList.add("hidden");

        const adapter = engine.network.adapter;
        setInterval(() => {
            switch (adapter.socket?.readyState) {
                case 0:
                    wsAdapterStatus.innerHTML = "<span style='color: orange;'>Connecting...</span>";
                    break;
                case 1:
                    wsAdapterStatus.innerHTML = "<span style='color: green;'>Connected</span>";
                    break;
                case 2:
                    wsAdapterStatus.innerHTML = "<span style='color: orange;'>Closing...</span>";
                    break;
                case 3:
                    wsAdapterStatus.innerHTML = "<span style='color: red;'>Disconnected</span>";
                    break;

                default:
                    break;
            }

        }, 10);
    }

    debugLevelSelect.addEventListener("change", (e) => {
        engine.debugger.debugLevel = parseInt(debugLevelSelect.value);
    });

    disablePrediction.addEventListener("change", (e) => {
        engine.debugger.noPrediction = disablePrediction.checked;
    });

    (document.getElementById(targetName) as HTMLDivElement).appendChild(debug);
}

async function liveReload() {
    await gameTemplate.reload();
    engines.forEach((engine) => {
        engine.reloadGameTemplate();
    });
}

document.addEventListener("keydown", async (e) => {
    if (e.key === "r") {
        liveReload();
    }
    if (e.key === "t") {
        engines.forEach((engine) => {
            engine.rollbackFromFrame(engine.currentState.frameIndex - 120);
        });
    }
    if (e.key === "m") {
        engines[0].audioAPI.enableAudio();
        engines[0].audioAPI.muted = !engines[0].audioAPI.muted;
    }
});