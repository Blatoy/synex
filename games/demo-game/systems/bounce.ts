import { System } from "game-lib/types/system.js";
import { Transform } from "demo-game/components/transform.js";
import { Entity } from "demo-game/metadata.js";
import { Velocity } from "../components/velocity.js";

export const BounceSystem: System = {
    requiredComponents: [Transform, Velocity],
    updateAll (entity: Entity) {
        if (entity.transform.position.x + entity.transform.size.x + entity.velocity.x > 1920) {
            entity.velocity.x *= -1;
            entity.transform.position.x = 1920 - entity.transform.size.x;
        }
        if (entity.transform.position.x + entity.velocity.x < 0) {
            entity.velocity.x *= -1;
            entity.transform.position.x = 0;
        }
        if (entity.transform.position.y + entity.transform.size.y + entity.velocity.y > 1080) {
            entity.velocity.y *= -1;
            entity.transform.position.y = 1080 - entity.transform.size.y;
        }
        if (entity.transform.position.y + entity.velocity.y < 0) {
            entity.velocity.y *= -1;
            entity.transform.position.y = 0;
        }
    }
};