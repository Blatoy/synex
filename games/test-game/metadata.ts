import main from "./scenes/main.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { GenericEntity } from "game-lib/types/entity.js";
import { GameMetadata } from "game-lib/types/game-metadata.js";
import { Debug } from "./components/debug.js";
import { Transform } from "./components/transform.js";
import { Velocity } from "./components/velocity.js";
import { Force } from "./components/force.js";
import { Bounce } from "./components/bounce.js";
import { Key } from "game-lib/utils/keycode.js";

const importSystems = SystemManager.createImporter(import.meta.url);

// while I would love for this to be defined directly in the export
// i did not manage (yet) to extract the type defined here
// instead of the one defined in the GameMetadata interface (try to move it down and observe how sad it is)
// maybe in the future, component name could be set directly in the component (?)
const components = {
    transform: Transform,
    velocity: Velocity,
    force: Force,
    debug: Debug,
    bounce: Bounce
};

export const gameDefinition: GameMetadata = {
    systems: await importSystems(
        "velocity",
        "render-debug",
        "force",
        "bounce"
    ),
    components: components,
    scenes: [
        main
    ],
    actions: {
        "default": {
            "up": {keys: [Key.W, Key.UpArrow] },
            "down": {keys: [Key.S, Key.DownArrow]},
            "left": {keys: [Key.A, Key.LeftArrow]},
            "right": {keys: [Key.D, Key.RightArrow]},
            "open_menu": {keys: [Key.Escape], synchronized: false },
        },
        "menu": {
            "close_menu": {keys: [Key.Escape], synchronized: false },
            "up": {keys: [Key.W, Key.UpArrow], synchronized: false },
            "down": {keys: [Key.S, Key.DownArrow], synchronized: false},
            "left": {keys: [Key.A, Key.LeftArrow], synchronized: false},
            "right": {keys: [Key.D, Key.RightArrow], synchronized: false}
    
        }
    },
    version: "1.0.0"
};

// Allows accessing components and getting autocompletion in systems
export type Entity = GenericEntity & { [K in keyof typeof components]: InstanceType<typeof components[K]> };