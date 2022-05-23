import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { MagneticField } from "demo-game/components/magnetic-field.js";
import { Magnetic } from "demo-game/components/magnetic.js";
import { Transform } from "demo-game/components/transform.js";
import { Velocity } from "demo-game/components/velocity.js";

export const MagneticFieldSystem: System = {
    requiredComponents: [[Transform, Velocity, Magnetic], [Transform, MagneticField]],
    update(entities: Entity[], fields: Entity[]) {
        for (const entity of entities) {
            entity.magnetic.inMagneticField = false;
            entity.magnetic.moveXLocked = false;
            entity.magnetic.moveYLocked = false;
            for (const field of fields) {
                const fpos = field.transform.position;
                const fsize = field.transform.size;
                const pos = entity.transform.position;
                const size = entity.transform.size;
                
                if (pos.x + size.x > fpos.x && pos.x < fpos.x + fsize.x) {
                    if (pos.y + size.y > fpos.y && pos.y < fpos.y + fsize.y) {
                        entity.magnetic.inMagneticField = true;
                        entity.magnetic.moveXLocked = field.magneticField.lockXMovement;
                        entity.magnetic.moveYLocked = field.magneticField.lockYMovement;

                        /* if (field.magneticField.lockYMovement) {
                            entity.velocity.x += (fpos.x - pos.x) * 0.05;
                        } */

                        entity.velocity.x += field.magneticField.force.x;
                        entity.velocity.y += field.magneticField.force.y;
                    }
                }

            }
        }
    }
};