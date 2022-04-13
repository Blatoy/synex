import { System } from "game-lib/types/system.js";
import { Owner } from "test-game/components/owner.js";
import { Entity } from "test-game/metadata.js";

import { Velocity } from "../components/velocity.js";

export const MoveSystem: System = {
    requiredComponents: [Velocity, Owner],
    updateAll(entity: Entity) {
        const playerActions = this.actions.ofPlayer(entity.owner.id);

        if (playerActions["default:move_right"]) {
            entity.velocity.linear.x = 5;
        } else if (playerActions["default:move_left"]) {
            entity.velocity.linear.x = -5;
        } else {
            entity.velocity.linear.x = 0;
        }

        if (playerActions["default:move_down"]) {
            entity.velocity.linear.y = 5;
        } else if (playerActions["default:move_up"]) {
            entity.velocity.linear.y = -5;
        } else {
            entity.velocity.linear.y = 0;
        }
    }
};