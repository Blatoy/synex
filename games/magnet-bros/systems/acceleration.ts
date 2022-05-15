import { System } from "game-lib/types/system.js";
import { Acceleration } from "magnet-bros/components/acceleration.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Entity } from "magnet-bros/metadata.js";

export const AccelerationSystem: System = {
    requiredComponents: [Acceleration, Velocity],
    updateAll(entity: Entity) {
        // Linear
        entity.velocity.linear.add(entity.acceleration.linear);
        entity.velocity.linear.capMax(entity.velocity.maxLinear);
        entity.velocity.linear.capMin(entity.velocity.minLinear);
        entity.velocity.linear.mulElementWise(entity.acceleration.linearFriction);

        // Angular
        entity.velocity.angular += entity.velocity.angular;
        entity.velocity.angular = Math.min(entity.velocity.angular, entity.velocity.maxAngular);
        entity.velocity.angular = Math.max(entity.velocity.angular, -entity.velocity.maxAngular);
        entity.velocity.angular *= entity.velocity.angular;
    }
};