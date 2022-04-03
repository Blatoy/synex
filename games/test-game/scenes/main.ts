import { Scene } from "game-lib/types/scene.js";
import { Force } from "test-game/components/force.js";
import { Debug } from "test-game/components/debug.js";
import { Transform } from "test-game/components/transform.js";
import { Velocity } from "test-game/components/velocity.js";
import { Bounce } from "test-game/components/bounce.js";

const main: Scene = {
    metadata: {
        name: "Main Scene"
    },
    entities: [
    ]
};

for (let i = 0; i < 5000; i++) {
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
                    valuesOverride: {}
                },
                {
                    Type: Force,
                    valuesOverride: {
                        acceleration: { y: 1 }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 255,
                            r: 0
                        },
                        fillRect: true,
                        showName: false
                    }
                }
            ]
        });
    }

}


export default main;