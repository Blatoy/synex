import { System } from "game-lib/types/system.js";
import { Entity } from "../metadata.js";

import { Transform } from "../components/transform.js";
import { Velocity } from "../components/velocity.js";

export const VelocitySystem: System = {
    requiredComponents: [Transform, Velocity],
    updateAll (entity: Entity) {
        entity.transform.position.x += entity.velocity.x;
        entity.transform.position.y += entity.velocity.y;
    }
};