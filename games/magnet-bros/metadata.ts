import main from "./scenes/main.js";
import { SystemManager } from "game-lib/utils/system-manager.js";
import { GenericEntity } from "game-lib/types/entity.js";
import { GameMetadata } from "game-lib/types/game-metadata.js";

import { Key } from "game-lib/utils/keycode.js";
import { Mouse } from "game-lib/utils/mouse.js";

import { Transform } from "game-lib/base-components/transform.js";
import { Debug } from "game-lib/base-components/debug.js";
import { Velocity } from "./components/velocity.js";
import { Acceleration } from "./components/acceleration.js";
import { BoxCollider } from "./components/box-collider.js";
import { ConstantAcceleration } from "./components/constant-acceleration.js";
import { Spawner } from "./components/spawner.js";
import { Sprite } from "./components/sprite.js";
import { RigidBody } from "./components/rigibody.js";
import { Owner } from "game-lib/base-components/owner.js";
import { Movement } from "./components/movement.js";
import { RespawnTimer } from "./components/respawn-timer.js";
import { Magnetic } from "./components/magnetic.js";
import { RadialMagneticField } from "./components/radial-magnetic-field.js";
import { Animation } from "magnet-bros/components/animation.js";
import { Lifetime } from "./components/lifetime.js";
import { Explode } from "./components/explode.js";
import { Explosion } from "./components/explosion.js";
import { TrackedEntity } from "./components/tracked-entity.js";
import { Camera } from "./components/camera.js";

const importSystems = SystemManager.createImporter(import.meta.url);


const components = {
    transform: Transform,
    velocity: Velocity,
    debug: Debug,
    owner: Owner,
    acceleration: Acceleration,
    boxCollider: BoxCollider,
    constantAcceleration: ConstantAcceleration,
    rigidBody: RigidBody,
    spawner: Spawner,
    movement: Movement,
    respawnTimer: RespawnTimer,
    sprite: Sprite,
    animation: Animation,
    magnetic: Magnetic,
    lifetime: Lifetime,
    explode: Explode,
    explosion: Explosion,
    radialField: RadialMagneticField,
    trackedEntity: TrackedEntity,
    camera: Camera
};

const systemFiles = [
    "update-debug",
    "music",
    "respawn",
    "death-detection",
    "spawner",
    "player-movement",
    "movement",
    "acceleration",
    "velocity",
    "collider",
    "magnets",
    "explosion",
    "movement-animations",
    "spawn-bomb",
    "update-animations",
    "lifetime",
    "credits",
    "player-despawner",
    "camera-tracker-start",
    "demo",
    "render-sprites",
    "render-magnets",
    "render-debug-magnets",
    "render-debug",
    "camera-tracker-end",
    "credits-render",
];

export const gameDefinition: GameMetadata = {
    systems: await importSystems(...systemFiles),
    systemNames: systemFiles,
    components: components,
    scenes: [
        main
    ],
    actions: {
        "default": {
            "debug_select": {
                mouseClick: [Mouse.left],
                keys: [],
                fireOnce: true,
                synchronized: false
            },
            "debug_scroll_down": {
                keys: [Key.Period],
                synchronized: false
            },
            "debug_scroll_up": {
                keys: [Key.Comma],
                synchronized: false
            },
            "open_menu": { keys: [Key.Escape], fireOnce: true, synchronized: false },
            "demo_1": { keys: [Key.Digit1], fireOnce: true },
            "demo_2": { keys: [Key.Digit2], fireOnce: true },
            "demo_3": { keys: [Key.Digit3], fireOnce: true },
            "demo_4": { keys: [Key.Digit4], fireOnce: true },
            "demo_5": { keys: [Key.Digit5], fireOnce: true },
            "demo_6": { keys: [Key.Digit6], fireOnce: true },
            "demo_7": { keys: [Key.Digit7], fireOnce: true },
            "jump": { keys: [Key.W, Key.ArrowUp, Key.Space] },
            "move_down": { keys: [Key.S, Key.ArrowDown] },
            "drop_down": { keys: [Key.Space] },
            "move_left": { keys: [Key.A, Key.ArrowLeft] },
            "move_right": { keys: [Key.D, Key.ArrowRight] },
            "spawn_item": { keys: [Key.Q, Key.ControlLeft, Key.F, Key.E], fireOnce: true },
            "toggle_magnet": { keys: [Key.ShiftLeft], fireOnce: true }
        },
        "menu": {
            "close": { keys: [Key.Escape], fireOnce: true, synchronized: false }
        }
    },
    version: "1.0.0"
};

// Allows accessing components and getting autocompletion in systems
export type Entity = GenericEntity & { 
    [K in keyof typeof components]: InstanceType<typeof components[K]> 
};

