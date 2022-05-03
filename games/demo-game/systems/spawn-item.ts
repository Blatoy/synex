import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Lifetime } from "demo-game/components/lifetime.js";
import { Owner } from "demo-game/components/owner.js";
import { Parent } from "demo-game/components/parent.js";
import { Transform } from "demo-game/components/transform.js";
import { Debug } from "demo-game/components/debug.js";
import { Magnetic } from "demo-game/components/magnetic.js";
import { Velocity } from "demo-game/components/velocity.js";
import { Explode } from "demo-game/components/explode.js";

export const SpawnItemSystem: System = {
    requiredComponents: [Owner, Transform, Parent],
    updateAll(entity: Entity) {
        const playerActions = this.actions.ofPlayer(entity.owner.id);
        if (playerActions["default:spawn_bomb"]) {
            this.entities.spawn(
                { Type: Magnetic },
                { 
                    Type: Explode,
                    valuesOverride: {
                        size: 200
                    }
                },
                { Type: Velocity },
                { 
                    Type: Lifetime,
                    valuesOverride: {
                        timeLeft: 60 * 2
                    }
                },
                {
                    Type: Transform,
                    valuesOverride: {
                        position: { x: entity.transform.position.x + entity.transform.size.x / 2 - 25, y: entity.transform.position.y + entity.transform.size.y},
                        size: { x: 50, y: 50 }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 20,
                            r: 155,
                            g: 20,
                            a: 1
                        },
                        strokeColor: {
                            b: 0,
                            r: 0,
                            g: 0
                        },
                        fillRect: true,
                        strokeRect: true,
                        showName: false
                    }
                }
            );
        }
    }
};