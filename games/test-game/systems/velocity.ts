import { RequiresComponents } from "game-lib/component.js";
import { System } from "game-lib/system.js";

import { Entity } from "../metadata.js";
import { Transform } from "../components/transform.js";
import { Velocity } from "../components/velocity.js";

export class VelocitySystem extends System {

    // Update all: no need for forEach, but can only request one entity
    @RequiresComponents(Transform, Velocity)
    updateAll(entity: Entity) {
        entity.transform.position.x += entity.velocity.linear.x;
        entity.transform.position.y += entity.velocity.linear.y;
    }
}