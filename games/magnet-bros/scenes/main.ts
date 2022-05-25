import { Debug } from "game-lib/base-components/debug.js";
import { Transform } from "game-lib/base-components/transform.js";
import { Scene } from "game-lib/types/scene.js";
import { BoxCollider } from "magnet-bros/components/box-collider.js";
import { Spawner } from "magnet-bros/components/spawner.js";
import { Sprite } from "magnet-bros/components/sprite.js";
import { BASE_IMAGE_PATH } from "magnet-bros/paths.js";

const main: Scene = {
    metadata: {
        name: "Main Scene"
    },
    entities: []
};

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const glassBaseComponents = [
    {
        Type: Debug,
        valuesOverride: {
            fillRect: false
        } as Debug
    },
    {
        Type: Sprite,
        valuesOverride: {
            sheetURL: `${BASE_IMAGE_PATH}/platform.png`,
            name: "platform",
            width: 500,
            height: 200,
        } as Sprite
    }
];



main.entities.push({
    metadata: { name: "Background-2" },
    components: [
        {
            Type: Sprite,
            valuesOverride: {
                sheetURL: `${BASE_IMAGE_PATH}/main-bg.png`,
                name: "background",
                width: 1920,
                height: 1080,
                parallax: 0.9,
            } as Sprite
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: 0, y: 0 },
                size: { x: GAME_WIDTH, y: GAME_HEIGHT }
            }
        }
    ]
});

main.entities.push({
    metadata: { name: "Background-2" },
    components: [
        {
            Type: Sprite,
            valuesOverride: {
                sheetURL: `${BASE_IMAGE_PATH}/galaxy.png`,
                name: "galaxy",
                width: 1920,
                height: 1080,
                parallax: 0.87,
            } as Sprite
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: 0, y: 0 },
                size: { x: GAME_WIDTH, y: GAME_HEIGHT }
            }
        }
    ]
});


main.entities.push({
    metadata: { name: "Background-3" },
    components: [
        {
            Type: Sprite,
            valuesOverride: {
                sheetURL: `${BASE_IMAGE_PATH}/sun.png`,
                name: "sun",
                width: 1200,
                height: 1050,
                parallax: 1,
            } as Sprite
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: -300, y: -300 },
                size: { x: 1200 / 2, y: 1050 / 2 }
            }
        }
    ]
});

main.entities.push({
    metadata: {
        name: "Player Spawner"
    },
    components: [
        { Type: Spawner },
        {
            Type: Debug,
            valuesOverride: {
                fillRect: false,
                fillColor: { r: 127, g: 0, b: 127, a: 0.5 }
            } as Debug
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
        {
            Type: Debug,
            valuesOverride: {
                fillRect: false
            } as Debug
        },
        {
            Type: Sprite,
            valuesOverride: {
                sheetURL: `${BASE_IMAGE_PATH}/main-platform.png`,
                name: "main-platform",
                width: 500,
                height: 109,
            } as Sprite
        },
        { Type: BoxCollider },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.7 },
                size: { x: GAME_WIDTH * 0.6, y: GAME_HEIGHT * 0.2 }
            }
        }
    ]
});

main.entities.push({
    metadata: {
        name: "Left platform"
    },
    components: [
        ...glassBaseComponents,
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
                size: { x: GAME_WIDTH * 0.12, y: GAME_HEIGHT * 0.06 }
            }
        }
    ]
});

main.entities.push({
    metadata: { name: "Right platform" },
    components: [
        ...glassBaseComponents,
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
                size: { x: GAME_WIDTH * 0.12, y: GAME_HEIGHT * 0.06 }
            }
        }
    ]
});

main.entities.push({
    metadata: { name: "Center platform" },
    components: [
        ...glassBaseComponents,
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
                size: { x: GAME_WIDTH * 0.12, y: GAME_HEIGHT * 0.06 }
            }
        }
    ]
});


export default main;