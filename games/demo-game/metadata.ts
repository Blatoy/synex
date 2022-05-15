import main from "./scenes/main.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { GenericEntity } from "game-lib/types/entity.js";
import { GameMetadata } from "game-lib/types/game-metadata.js";

import { Key } from "game-lib/utils/keycode.js";

import { Transform } from "./components/transform.js";
import { Velocity } from "./components/velocity.js";
import { Debug } from "./components/debug.js";
import { Force } from "./components/force.js";
import { Owner } from "./components/owner.js";
import { Spawner } from "./components/spawner.js";
import { Animation } from "./components/animation.js";
import { MagneticField } from "./components/magnetic-field.js";
import { Magnetic } from "./components/magnetic.js";
import { Parent } from "./components/parent.js";
import { Parented } from "./components/parented.js";
import { Lifetime } from "./components/lifetime.js";
import { Damage } from "./components/damage.js";
import { Explode } from "./components/explode.js";
import { Health } from "./components/health.js";
import { DemoSelected } from "./components/demo-selected.js";
import { Mouse } from "game-lib/utils/mouse.js";

const importSystems = SystemManager.createImporter(import.meta.url);


const components = {
    transform: Transform,
    velocity: Velocity,
    debug: Debug,
    animation: Animation,
    force: Force,
    owner: Owner,
    spawner: Spawner,
    magneticField: MagneticField,
    magnetic: Magnetic,
    parent: Parent,
    parented: Parented,
    lifetime: Lifetime,
    damage: Damage,
    explode: Explode,
    health: Health,
    demoSelected: DemoSelected
};

export const gameDefinition: GameMetadata = {
    systems: await importSystems(
        "render-background",
        "player-spawner",
        "player-despawner",
        "magnetic-field",
        "move",
        "force",
        "velocity",
        "bounce",
        "lifetime",
        "explode",
        "damage",
        "spawn-item",
        "move-animation",
        "update-animations",
        "parent",
        "render-animations",
        "render-debug",
        "demo-update",
        "demo-render",
    ),
    components: components,
    scenes: [
        main
    ],
    actions: {
        "default": {
            "debug_select": { keys: [Key.ControlLeft], mouseClick: [Mouse.left]},
            "move_up": { keys: [Key.W, Key.ArrowUp] },
            "move_down": { keys: [Key.S, Key.ArrowDown] },
            "move_left": { keys: [Key.A, Key.ArrowLeft] },
            "move_right": { keys: [Key.D, Key.ArrowRight] },
            "run": { keys: [Key.ShiftLeft] },
            "spawn_bomb": { keys: [Key.Space] },
            "respawn": { keys: [Key.R], fireOnce: true },
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