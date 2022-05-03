import { Scene } from "game-lib/types/scene.js";
import { Debug } from "../components/debug.js";
import { Transform } from "../components/transform.js";
import { Spawner } from "../components/spawner.js";
import { MagneticField } from "demo-game/components/magnetic-field.js";

const main: Scene = {
    metadata: {
        name: "Main Scene"
    },
    entities: []
};

main.entities.push({
    metadata: {
        name: "Player Spawner"
    },
    components: [
        {
            Type: Spawner
        },
        {
            Type: Transform,
            valuesOverride: {
                position: { x: 1920 / 2, y: 1080 / 2 },
                size: { x: 16 * 5, y: 32 * 5 }
            }
        }
    ]
});

export default main;