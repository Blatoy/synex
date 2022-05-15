import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Entity } from "magnet-bros/metadata.js";

export const SpeedSystem: System = {
    requiredComponents: [Transform, Velocity],
    updateAll(entity: Entity) {
        entity.transform.position.add(entity.velocity.linear);
        entity.transform.rotation += entity.velocity.angular;
    }
};