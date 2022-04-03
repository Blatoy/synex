import { System } from "game-lib/types/system.js";
import { Bounce } from "test-game/components/bounce.js";
import { Transform } from "test-game/components/transform.js";
import { Entity } from "test-game/metadata.js";
import { Velocity } from "../components/velocity.js";

export const BounceSystem: System = {
    requiredComponents: [Transform, Bounce, Velocity],
    updateAll: (entity: Entity) => {
        if (entity.transform.position.x + entity.transform.size.x > 1920 || entity.transform.position.x < 0) {
            entity.velocity.linear.x *= -entity.bounce.bounciness;
        }
        if (entity.transform.position.y + entity.transform.size.y > 1080) {
            entity.velocity.linear.y *= -entity.bounce.bounciness;
        }
    }
};