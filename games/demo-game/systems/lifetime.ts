import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Lifetime } from "demo-game/components/lifetime.js";

export const MagneticFieldSystem: System = {
    requiredComponents: [Lifetime],
    updateAll(entity: Entity) {
        entity.lifetime.timeLeft--;
        if (entity.lifetime.timeLeft < 0) {
            entity.meta.delete();
        }
    }
};