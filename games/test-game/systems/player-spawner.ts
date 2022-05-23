import { System } from "game-lib/types/system.js";
import { Bounce } from "test-game/components/bounce.js";
import { Debug } from "test-game/components/debug.js";
import { DemoSelected } from "test-game/components/demo-selected.js";
import { Menu } from "test-game/components/menu.js";
import { Owner } from "test-game/components/owner.js";
import { Spawner } from "test-game/components/spawner.js";
import { Transform } from "test-game/components/transform.js";
import { Entity } from "test-game/metadata.js";

import { Velocity } from "../components/velocity.js";

export const PlayerSpawner: System = {
    requiredComponents: [Spawner, Transform],
    updateAll(spawner: Entity) {
        const joinActions = this.actions.byType("network", "sceneLoaded");


        for (const action of joinActions) {
            this.entities.spawn("Player " + action.ownerId,
                { Type: Owner, valuesOverride: { id: action.ownerId } },
                { Type: Menu },
                { Type: DemoSelected },
                { Type: Velocity },
                {
                    Type: Transform,
                    valuesOverride: {
                        position: {
                            x: spawner.transform.position.x,
                            y: spawner.transform.position.y
                        }
                    }
                },
                {
                    Type: Bounce,
                    valuesOverride: {
                        bounciness: 0.99
                    }
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
            );
        }
    }
};