import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";
import { Lifetime } from "magnet-bros/components/lifetime.js";

export const LifetimeSystem: System = {
    requiredComponents: [Lifetime],
    updateAll(entity: Entity) {
        if (entity.lifetime.enabled) {
            entity.lifetime.timeLeft--;
            if (entity.lifetime.timeLeft <= 0) {
                entity.meta.delete();
            }
        }
    }
};