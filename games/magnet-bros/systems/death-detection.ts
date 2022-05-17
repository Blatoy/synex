import { Debug } from "game-lib/base-components/debug.js";
import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Color } from "game-lib/utils/color.js";
import { Explosion } from "magnet-bros/components/explosion.js";
import { Lifetime } from "magnet-bros/components/lifetime.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { RespawnTimer } from "magnet-bros/components/respawn-timer.js";
import { Entity, gameDefinition } from "magnet-bros/metadata.js";

const maxDist = 50;
export const AccelerationSystem: System = {
    requiredComponents: [Transform, RespawnTimer],
    updateAll(entity: Entity) {
        // TODO: Add API for game info
        if (!entity.respawnTimer.enabled && (
            entity.transform.position.y > 1080 + maxDist ||
            entity.transform.position.x < -maxDist ||
            entity.transform.position.x > 1920 + maxDist ||
            entity.transform.position.y < -maxDist * 2)) {
            entity.respawnTimer.enabled = true;

            this.entities.spawn("Death area of " + entity.meta.name,
                {
                    Type: Transform,
                    valuesOverride: {
                        position: entity.transform.position,
                        size: entity.transform.size
                    } as Transform
                },
                {
                    Type: Debug
                },
                {
                    Type: Lifetime,
                    valuesOverride: {
                        timeLeft: 30
                    } as Lifetime
                },
                {
                    Type: RadialMagneticField,
                    valuesOverride: {
                        force: 25000,
                        radius: 1,
                        backColor: new Color(255, 255, 255, 0.2)
                    } as RadialMagneticField
                },
                {
                    Type: Explosion,
                    valuesOverride: {
                        maxRadius: 400
                    } as Explosion
                }
            );

            entity.transform.position.y = Number.MAX_SAFE_INTEGER;
        }
    }
};