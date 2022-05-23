import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Animation } from "../components/animation.js";
import { Velocity } from "../components/velocity.js";
import { Magnetic } from "demo-game/components/magnetic.js";


export const MoveAnimationSystem: System = {
    requiredComponents: [Animation, Velocity, Magnetic],
    updateAll(entity: Entity) {
        if (entity.velocity.x > 0) {
            entity.animation.facingRight = false;
        } else if (entity.velocity.x < 0) {
            entity.animation.facingRight = true;
        }

        if (entity.magnetic.inMagneticField) {
            entity.animation.setAnimation("zip");
        } else if (Math.abs(entity.velocity.x) > 2 || Math.abs(entity.velocity.y) > 2) {
            entity.animation.setAnimation("run");
        } else if (Math.abs(entity.velocity.x) > 0.2 || Math.abs(entity.velocity.y) > 0.2) {
            entity.animation.setAnimation("skid");
        } else {
            entity.animation.setAnimation("idle");
        }
    }
};