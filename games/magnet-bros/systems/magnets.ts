import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Vector2 } from "game-lib/utils/vector2.js";
import { Magnetic } from "magnet-bros/components/magnetic.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Entity } from "magnet-bros/metadata.js";

export const MagnetSystems: System = {
    requiredComponents: [[Transform, Velocity, Magnetic], [Transform, RadialMagneticField]],
    update(entities: Entity[], radialFields: Entity[]) {
        for (const radialField of radialFields) {
            for (const entity of entities) {
                if (entity !== radialField) {
                    const center = new Vector2(
                        radialField.transform.position.x + radialField.transform.size.x / 2,
                        radialField.transform.position.y + radialField.transform.size.y / 2,
                    );

                    if (entity.transform.intersectsCircle(
                        center,
                        radialField.radialField.radius)
                    ) {
                        const direction = entity.transform.position.directionFrom(radialField.transform.position);
                        direction.makeUnit();
                        direction.scale(radialField.radialField.force);
                        entity.velocity.linear.add(direction);
                    }
                }
            }
        }
    }
};