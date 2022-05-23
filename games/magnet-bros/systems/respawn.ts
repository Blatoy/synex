import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";
import { RespawnTimer } from "magnet-bros/components/respawn-timer.js";
import { Owner } from "game-lib/base-components/owner.js";

export type RespawnParameters = {
    owner: string
};

export const SpawnerSystem: System = {
    requiredComponents: [RespawnTimer, Owner],
    updateAll(entity: Entity) {
        if (entity.respawnTimer.enabled) {
            entity.respawnTimer.timeLeft--;
            if (entity.respawnTimer.timeLeft <= 0) {
                // TODO: Most elegant way would be to be able to trigger actions
                // this.actions.trigger("respawn", { owner: entity.owner.id } as RespawnParameters);
                entity.meta.delete();
            }
        }
    }
};