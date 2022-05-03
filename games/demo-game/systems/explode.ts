import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Lifetime } from "demo-game/components/lifetime.js";
import { Explode } from "demo-game/components/explode.js";
import { Damage } from "demo-game/components/damage.js";
import { Transform } from "demo-game/components/transform.js";
import { Debug } from "demo-game/components/debug.js";

export const MagneticFieldSystem: System = {
    requiredComponents: [Transform, Lifetime, Explode],
    updateAll(entity: Entity) {
        
        if (entity.lifetime.timeLeft === 0) {
            const cx = entity.transform.position.x + entity.transform.size.x / 2;
            const cy = entity.transform.position.y + entity.transform.size.y / 2;

            this.entities.spawn(
                { 
                    Type: Lifetime,
                    valuesOverride: {
                        timeLeft: 60 * 0.2
                    }
                },
                { Type: Damage },
                {
                    Type: Transform,
                    valuesOverride: {
                        position: { x: cx - entity.explode.size / 2, y: cy - entity.explode.size / 2},
                        size: { x: entity.explode.size, y: entity.explode.size }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 180,
                            r: 255,
                            g: 180,
                            a: 0.5
                        },
                        fillRect: true,
                        strokeRect: false,
                        showName: false
                    }
                }
            );
        }
    }
};