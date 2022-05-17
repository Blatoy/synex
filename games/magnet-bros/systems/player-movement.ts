import { Owner } from "game-lib/base-components/owner.js";
import { System } from "game-lib/types/system.js";
import { Magnetic } from "magnet-bros/components/magnetic.js";
import { Movement } from "magnet-bros/components/movement.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { Entity } from "magnet-bros/metadata.js";

export const PlayerMovementSystem: System = {
    requiredComponents: [Movement, Owner, RadialMagneticField, Magnetic],
    updateAll(entity: Entity) {
        const playerActions = this.actions.ofPlayer(entity.owner.id);

        entity.movement.movingRight = playerActions["default:move_right"] ? true : false;
        entity.movement.movingLeft = playerActions["default:move_left"] ? true : false;
        entity.movement.movingDown = playerActions["default:move_down"] ? true : false;
        entity.movement.jumping = (playerActions["default:jump"] ? true : false)
            && (playerActions["default:move_down"] ? false : true);
        entity.movement.fallThrough = (playerActions["default:move_down"] ? true : false)
            && (playerActions["default:drop_down"] ? true : false);

        if (playerActions["default:toggle_magnet"]) {
            entity.radialField.active = !entity.radialField.active;
            entity.magnetic.active = !entity.magnetic.active;
        }
    }
};