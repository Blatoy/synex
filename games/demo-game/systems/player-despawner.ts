import { System } from "game-lib/types/system.js";
import { Owner } from "demo-game/components/owner.js";
import { Entity } from "demo-game/metadata.js";

export const PlayerDespawner: System = {
    requiredComponents: [Owner],
    updateAll(despawnedEntity: Entity) {
        const playerActions = this.actions.ofPlayer(despawnedEntity.owner.id);

        if (playerActions["network:disconnect"]) {
            despawnedEntity.meta.delete();
        }
    }
};