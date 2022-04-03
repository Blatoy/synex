import { System } from "game-lib/types/system.js";
import { Entity } from "test-game/metadata.js";

import { Force } from "../components/force.js";
import { Velocity } from "../components/velocity.js";

export const ForceSystem: System = {
    requiredComponents: [Force, Velocity],
    updateAll: (entity: Entity) => {
        entity.velocity.linear.x += entity.force.acceleration.x;
        entity.velocity.linear.y += entity.force.acceleration.y;
    }
};