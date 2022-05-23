import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Damage } from "demo-game/components/damage.js";
import { Transform } from "demo-game/components/transform.js";
import { Health } from "demo-game/components/health.js";

export const MagneticFieldSystem: System = {
    requiredComponents: [[Transform, Health], [Transform, Damage]],
    update(entities: Entity[], damages: Entity[]) {
        for (const entity of entities) {
            entity.health.invulFrame--;
            if (entity.health.invulFrame < 0) {
                const pos = entity.transform.position;
                const size = entity.transform.size;
                for (const damage of damages) {
                    const dpos = damage.transform.position;
                    const dsize = damage.transform.size;
                    if (pos.x + size.x > dpos.x && pos.x < dpos.x + dsize.x) {
                        if (pos.y + size.y > dpos.y && pos.y < dpos.y + dsize.y) {
                            entity.health.amount -= damage.damage.amount;
                            entity.health.invulFrame = 5;
                        }

                        if (entity.health.amount < 0) {
                            entity.meta.delete();
                        }
                    }
                }
                
            }
        }
        /* entity.lifetime.timeLeft--;
        if (entity.lifetime.timeLeft < 0) {
            entity.meta.delete();
        } */
    }
};