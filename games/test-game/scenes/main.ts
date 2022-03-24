import { Scene } from "game-lib/scene.js";
import { Debug } from "test-game/components/debug.js";
import { Transform } from "test-game/components/transform.js";
import { Velocity } from "test-game/components/velocity.js";

const main: Scene = {
    metadata: {
        name: "Main Scene"
    },
    entities: [
        {
            metadata: {
                name: "Test Entity"
            },
            components: [
                {
                    Type: Transform,
                    valuesOverride: {
                        position: { x: 100, y: 100 }
                    }
                },
                {
                    Type: Velocity,
                    valuesOverride: {}
                },
                {
                    Type: Debug,
                    valuesOverride: {}
                }
            ]
        },
        {
            metadata: {
                name: "Test Blue Entity"
            },
            components: [
                {
                    Type: Transform,
                    valuesOverride: {
                        position: { x: 300, y: 300 }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 255,
                            r: 0
                        },
                        fillRect: true
                    }
                }
            ]
        }
    ]
};

export default main;