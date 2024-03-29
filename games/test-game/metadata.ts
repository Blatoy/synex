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
import { Owner } from "./components/owner.js";
import { Menu } from "./components/menu.js";
import { Spawner } from "./components/spawner.js";
import { Mouse } from "game-lib/utils/mouse.js";
import { DemoSelected } from "./components/demo-selected.js";

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
    bounce: Bounce,
    owner: Owner,
    menu: Menu,
    spawner: Spawner,
    demoSelected: DemoSelected
};

export const gameDefinition: GameMetadata = {
    systems: await importSystems(
        "velocity",
        "render-debug",
        "demo-update",
        "demo-render",
        "player-spawner",
        "force",
        "bounce",
        "move",
        "menu"
    ),
    systemNames: [],
    components: components,
    scenes: [
        main
    ],
    actions: {
        "default": {
            "debug_select": { keys: [Key.ControlLeft], mouseClick: [Mouse.left], synchronized: false },
            "teleport_player": { keys: [Key.ControlLeft], mouseDown: [Mouse.middle] },
            "move_up": { keys: [Key.W, Key.ArrowUp] },
            "move_down": { keys: [Key.S, Key.ArrowDown] },
            "move_left": { keys: [Key.A, Key.ArrowLeft] },
            "move_right": { keys: [Key.D, Key.ArrowRight] },
            "open_menu": { keys: [Key.Escape], synchronized: false, fireOnce: true },
        },
        "menu": {
            "spawn": { keys: [Key.P], synchronized: false, fireOnce: true },
            "close_menu": { keys: [Key.Escape], synchronized: false, fireOnce: true },
            "enter": { keys: [Key.Enter, Key.Space], synchronized: false, fireOnce: true },
            "left": { keys: [Key.A, Key.ArrowLeft, Key.W, Key.ArrowUp], synchronized: false, fireOnce: true },
            "right": { keys: [Key.D, Key.ArrowRight, Key.S, Key.ArrowDown], synchronized: false, fireOnce: true }
        }
    },
    version: "1.0.0"
};

// Allows accessing components and getting autocompletion in systems
export type Entity = GenericEntity & { [K in keyof typeof components]: InstanceType<typeof components[K]> };