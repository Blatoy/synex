import { Debug } from "game-lib/base-components/debug.js";
import { Transform } from "game-lib/base-components/transform.js";
import { Scene } from "game-lib/types/scene.js";
import { BoxCollider } from "magnet-bros/components/box-collider.js";
import { Spawner } from "magnet-bros/components/spawner.js";

const main: Scene = {
    metadata: {
        name: "Main Scene"
    },
    entities: []
};

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const groundBaseComponents = [
    { Type: Debug }
];


main.entities.push({
    metadata: {
        name: "Player Spawner"
    },
    components: [
        { Type: Spawner },
        {
            Type: Debug,
            valuesOverride: {
                fillColor: { r: 127, g: 0, b: 127, a: 0.5 }
            }
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: GAME_WIDTH * 0.5 - (32 * 1.5) / 2, y: GAME_HEIGHT * 0.5 },
                size: { x: 32 * 1.5, y: 64 * 1.5 }
            }
        }
    ]
});

main.entities.push({
    metadata: {
        name: "Main ground"
    },
    components: [
        ...groundBaseComponents,
        { Type: BoxCollider },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.7 },
                size: { x: GAME_WIDTH * 0.6, y: GAME_HEIGHT * 0.1 }
            }
        }
    ]
});

main.entities.push({
    metadata: {
        name: "Left platform"
    },
    components: [
        ...groundBaseComponents,
        {
            Type: BoxCollider,
            valuesOverride: {
                collisions: { left: false, right: false, bottom: false }
            } as BoxCollider
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: GAME_WIDTH * 0.25, y: GAME_HEIGHT * 0.47 },
                size: { x: GAME_WIDTH * 0.12, y: GAME_HEIGHT * 0.02 }
            }
        }
    ]
});

main.entities.push({
    metadata: { name: "Right platform" },
    components: [
        ...groundBaseComponents,
        {
            Type: BoxCollider,
            valuesOverride: {
                collisions: { left: false, right: false, bottom: false }
            } as BoxCollider
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: GAME_WIDTH * (0.75 - 0.12), y: GAME_HEIGHT * 0.47 },
                size: { x: GAME_WIDTH * 0.12, y: GAME_HEIGHT * 0.02 }
            }
        }
    ]
});

main.entities.push({
    metadata: { name: "Center platform" },
    components: [
        ...groundBaseComponents,
        {
            Type: BoxCollider,
            valuesOverride: {
                collisions: { left: false, right: false, bottom: false }
            } as BoxCollider
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: GAME_WIDTH * (0.5 - 0.06), y: GAME_HEIGHT * 0.3 },
                size: { x: GAME_WIDTH * 0.12, y: GAME_HEIGHT * 0.02 }
            }
        }
    ]
});


export default main;