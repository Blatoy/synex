import { System } from "game-lib/types/system.js";
import { Entity } from "test-game/metadata.js";

import { Transform } from "../components/transform.js";
import { Velocity } from "../components/velocity.js";

export const VelocitySystem: System = {
    requiredComponents: [Transform, Velocity],
    updateAll: (entity: Entity) => {
        entity.transform.position.x += entity.velocity.linear.x;
        entity.transform.position.y += entity.velocity.linear.y;
    }
};