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
    magnetic: Magnetic,
    radialField: RadialMagneticField
};

const systemFiles = [
    "update-debug",
    "respawn",
    "death-detection",
    "spawner",
    "player-movement",
    "movement",
    "magnets",
    "acceleration",
    "velocity",
    "collider",
    "render-sprites",
    "render-debug-magnets",
    "render-debug"
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
                keys: [Key.ControlLeft],
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
            "jump": { keys: [Key.W, Key.ArrowUp, Key.Space] },
            "move_down": { keys: [Key.S, Key.ArrowDown] },
            "drop_down": { keys: [Key.Space] },
            "move_left": { keys: [Key.A, Key.ArrowLeft] },
            "move_right": { keys: [Key.D, Key.ArrowRight] }
        }
    },
    version: "1.0.0"
};

// Allows accessing components and getting autocompletion in systems
export type Entity = GenericEntity & { [K in keyof typeof components]: InstanceType<typeof components[K]> };
