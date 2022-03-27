import { GameEntity } from "game-lib/game-entity.js";
import { GameDefinition, importGameSystems } from "game-lib/metadata.js";
import { Debug } from "./components/debug.js";
import { Transform } from "./components/transform.js";
import { Velocity } from "./components/velocity.js";
import main from "./scenes/main.js";

const importSystems = importGameSystems(import.meta.url);

// while I would love for this to be defined directly in the export
// i did not manage (yet) to extract the type defined here
// instead of the one defined in the GameMetadata interface (try to move it down and observe how sad it is)
// maybe in the future, component name could be set directly in the component (?)
const components = {
    transform: Transform,
    velocity: Velocity,
    debug: Debug
};

export const gameDefinition: GameDefinition = {
    systems: await importSystems(
        "velocity",
        "render-debug"
    ),
    components: components,
    scenes: [
        main
    ],
    version: "1.0.0"
};

// Allows accessing components and getting autocompletion in systems
export type Entity = { meta: GameEntity } & { [K in keyof typeof components]: InstanceType<typeof components[K]> };