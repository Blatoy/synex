import { Owner } from "game-lib/base-components/owner.js";
import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";

export const PlayerDespawner: System = {
    requiredComponents: [Owner],
    updateAll(despawnedEntity: Entity) {
        const playerActions = this.actions.ofPlayer(despawnedEntity.owner.id);

        if (playerActions["network:disconnect"]) {
            despawnedEntity.meta.delete();
        }
    }
};