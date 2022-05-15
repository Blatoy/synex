import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { RespawnTimer } from "magnet-bros/components/respawn-timer.js";
import { Entity, gameDefinition } from "magnet-bros/metadata.js";

export const AccelerationSystem: System = {
    requiredComponents: [Transform, RespawnTimer],
    updateAll(entity: Entity) {
        // TODO: Add API for game info
        if (entity.transform.position.y > 1200) {
            entity.respawnTimer.enabled = true;
            entity.transform.position.y = Number.MAX_SAFE_INTEGER;
        }
    }
};