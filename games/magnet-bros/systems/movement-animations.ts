import { Owner } from "game-lib/base-components/owner.js";
import { System } from "game-lib/types/system.js";
import { Animation } from "magnet-bros/components/animation.js";
import { RigidBody } from "magnet-bros/components/rigibody.js";
import { Sprite } from "magnet-bros/components/sprite.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Entity } from "magnet-bros/metadata.js";

export const MovementAnimationSystem: System = {
    requiredComponents: [Owner, Velocity, Animation, RigidBody, Sprite],
    updateAll(entity: Entity) {
        const absHorizontal = Math.abs(entity.velocity.linear.x);

        if (entity.velocity.linear.x > 0.5) {
            entity.sprite.mirrorX = false;
        } else if (entity.velocity.linear.x < -0.5) {
            entity.sprite.mirrorX = true;
        }

        // in air
        if (!entity.rigidBody.grounded) {
            if (entity.velocity.linear.y > 0) {
                entity.animation.setAnimation("jumpEnd");
            } else {
                entity.animation.setAnimation("jumpStart");
            }
        } else {
            if (absHorizontal < 0.1) {
                entity.animation.setAnimation("idle");
            } else if (absHorizontal < 10) {
                entity.animation.setAnimation("skid");
            } else {
                entity.animation.setAnimation("run");
            }
        }
    }
};