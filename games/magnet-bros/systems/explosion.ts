import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";
import { Explosion } from "magnet-bros/components/explosion.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";

export type RespawnParameters = {
    owner: string
};

export const ExplosionSystem: System = {
    requiredComponents: [Explosion, RadialMagneticField],
    updateAll(entity: Entity) {
        if (entity.radialField.radius < entity.explosion.maxRadius) {
            entity.radialField.radius += 0.5 * (entity.explosion.maxRadius - entity.radialField.radius);
        }
    }
};