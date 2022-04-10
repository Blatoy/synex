import { System } from "game-lib/types/system.js";
import { Bounce } from "test-game/components/bounce.js";
import { Transform } from "test-game/components/transform.js";
import { Entity } from "test-game/metadata.js";
import { Velocity } from "../components/velocity.js";

export const BounceSystem: System = {
    requiredComponents: [Transform, Bounce, Velocity],
    updateAll (entity: Entity) {
        if (entity.transform.position.x + entity.transform.size.x + entity.velocity.linear.x > 1920) {
            entity.velocity.linear.x *= -entity.bounce.bounciness;
            entity.transform.position.x = 1920 - entity.transform.size.x;
        }
        if (entity.transform.position.x + entity.velocity.linear.x < 0) {
            entity.velocity.linear.x *= -entity.bounce.bounciness;
            entity.transform.position.x = 0;
        }
        if (entity.transform.position.y + entity.transform.size.y + entity.velocity.linear.y > 1080) {
            entity.velocity.linear.y *= -entity.bounce.bounciness;
            entity.transform.position.y = 1080 - entity.transform.size.y;
        }
        if (entity.transform.position.y + entity.velocity.linear.y < 0) {
            entity.velocity.linear.y *= -entity.bounce.bounciness;
            entity.transform.position.y = 0;
        }
    }
};