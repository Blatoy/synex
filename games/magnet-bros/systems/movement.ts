import { Owner } from "game-lib/base-components/owner.js";
import { System } from "game-lib/types/system.js";
import { Acceleration } from "magnet-bros/components/acceleration.js";
import { Movement } from "magnet-bros/components/movement.js";
import { RigidBody } from "magnet-bros/components/rigibody.js";
import { Entity } from "magnet-bros/metadata.js";

export const MovementSystem: System = {
    requiredComponents: [Movement, Acceleration, RigidBody],
    updateAll(entity: Entity) {
        if (entity.movement.movingRight) {
            entity.acceleration.linear.x = entity.movement.acceleration;
        } else if (entity.movement.movingLeft) {
            entity.acceleration.linear.x = -entity.movement.acceleration;
        } else {
            entity.acceleration.linear.x = 0;
        }

        if (entity.rigidBody.grounded) {
            entity.movement.jumpTickLeft = entity.movement.maxJumpTick;
        } else {
            entity.movement.jumpTickLeft--;
        }


        if (entity.movement.jumping && entity.movement.jumpTickLeft > 0) {
            const jumpProgress = (entity.movement.jumpTickLeft / entity.movement.maxJumpTick);
            entity.velocity.linear.y += jumpProgress * entity.movement.jumpForce;
        }
    }
};