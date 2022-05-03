import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Force } from "../components/force.js";
import { Velocity } from "../components/velocity.js";

export const ForceSystem: System = {
    requiredComponents: [Force, Velocity],
    updateAll (entity: Entity) {
        entity.velocity.x += entity.force.acceleration.x;
        entity.velocity.y += entity.force.acceleration.y;
    }
};