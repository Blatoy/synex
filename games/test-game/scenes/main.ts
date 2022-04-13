import { Scene } from "game-lib/types/scene.js";
import { Force } from "test-game/components/force.js";
import { Debug } from "test-game/components/debug.js";
import { Transform } from "test-game/components/transform.js";
import { Velocity } from "test-game/components/velocity.js";
import { Bounce } from "test-game/components/bounce.js";
import { Owner } from "test-game/components/owner.js";
import { Menu } from "test-game/components/menu.js";

const main: Scene = {
    metadata: {
        name: "Main Scene"
    },
    entities: [
    ]
};


for (let i = 0; i < 500; i++) {
    const x = i % 32;
    const y = i / 32;

    if (Math.random() > 0.5) {
        main.entities.push({
            metadata: {
                name: "Entity #" + i
            },
            components: [
                {
                    Type: Transform,
                    valuesOverride: {
                        position: { x: x * 1920 / 32, y: y * 1080 / 32 }
                    }
                },
                {
                    Type: Velocity,
                    valuesOverride: {
                        linear: { x: Math.random() - 0.5, y: Math.random() - 0.5 }
                    }
                },
                {
                    Type: Bounce,
                    valuesOverride: {}
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 0,
                            r: 255
                        },
                        fillRect: true,
                        strokeRect: false,
                        showName: false
                    }
                }
            ]
        });
    } else {
        main.entities.push({
            metadata: {
                name: "Entity #" + i
            },
            components: [
                {
                    Type: Transform,
                    valuesOverride: {
                        position: { x: x * 1920 / 32, y: y * 1080 / 32 }
                    }
                },
                {
                    Type: Velocity,
                    valuesOverride: {
                        linear: { x: Math.random() - 0.5, y: Math.random() - 0.5 }
                    }
                },
                {
                    Type: Bounce,
                    valuesOverride: {
                        bounciness: 0.99
                    }
                },
                {
                    Type: Force,
                    valuesOverride: {
                        acceleration: { y: 0.05 }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 255,
                            r: 0
                        },
                        strokeColor: {
                            b: 255,
                            r: 0
                        },
                        fillRect: true,
                        strokeRect: false,
                        showName: false
                    }
                }
            ]
        });
    }

}

main.entities.push({
    metadata: {
        name: "Yellow Entity"
    },
    components: [
        {
            Type: Transform,
            valuesOverride: {
                position: { x: 1920 / 2, y: 1080 / 2 }
            }
        },
        {
            Type: Velocity,
            valuesOverride: {
                linear: { x: Math.random() - 0, y: Math.random() - 0 }
            }
        },
        {
            Type: Bounce,
            valuesOverride: {
                bounciness: 0.99
            }
        },
        {
            Type: Owner,
            valuesOverride: {}
        },
        {
            Type: Menu,
            valuesOverride: {}
        },
        {
            Type: Debug,
            valuesOverride: {
                fillColor: {
                    b: 0,
                    r: 255,
                    g: 255
                },
                strokeColor: {
                    b: 0,
                    r: 255,
                    g: 255
                },
                fillRect: true,
                showName: true
            }
        }
    ]
});



export default main;