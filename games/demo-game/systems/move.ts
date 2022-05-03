import { System } from "game-lib/types/system.js";
import { Owner } from "../components/owner.js";
import { Entity } from "../metadata.js";

import { Velocity } from "../components/velocity.js";
import { Magnetic } from "demo-game/components/magnetic.js";
import { MagneticField } from "demo-game/components/magnetic-field.js";
import { Parented } from "demo-game/components/parented.js";
import { Parent } from "demo-game/components/parent.js";

export const MoveSystem: System = {
    requiredComponents: [[Velocity, Owner, Magnetic, Parent], [MagneticField, Parented]],
    update(entities: Entity[], magneticFields: Entity[]) {
        const fieldSize = 300;
        const magneticFieldForce = 1;

        for (const entity of entities) {
            let speed = 5;

            const playerActions = this.actions.ofPlayer(entity.owner.id);
            if (playerActions["default:run"]) {
                speed = 10;
            }

            const ownedFields = magneticFields.filter(field => field.parented.parentId === entity.parent.id);

            if (!entity.magnetic.moveYLocked) {
                if (playerActions["default:move_down"]) {
                    entity.velocity.y = speed;
                    ownedFields.forEach(field => {
                        field.transform.size.x = 0;
                        field.transform.size.y = 0;
                    });
                } else if (playerActions["default:move_up"]) {
                    entity.velocity.y = -speed;
                    ownedFields.forEach(field => {
                        field.transform.size.x = entity.transform.size.x;
                        field.transform.size.y = fieldSize;
                        field.magneticField.force.x = 0;
                        field.magneticField.force.y = -magneticFieldForce;
                        field.magneticField.lockXMovement = false;
                        field.magneticField.lockYMovement = true;
                        field.parented.offsetX = 0;
                        field.parented.offsetY = -fieldSize;
                    });
                } else {
                    entity.velocity.y = 0;
                }
            }


            if (!entity.magnetic.moveXLocked) {
                if (playerActions["default:move_right"]) {
                    entity.velocity.x = speed;
                    ownedFields.forEach(field => {
                        field.transform.size.x = fieldSize;
                        field.transform.size.y = entity.transform.size.x;
                        field.parented.offsetX = entity.transform.size.x;
                        field.magneticField.force.y = 0;
                        field.magneticField.force.x = magneticFieldForce;
                        field.magneticField.lockXMovement = true;
                        field.magneticField.lockYMovement = false;
                        field.parented.offsetY = 30;
                    });
                } else if (playerActions["default:move_left"]) {
                    ownedFields.forEach(field => {
                        field.transform.size.x = fieldSize;
                        field.transform.size.y = entity.transform.size.x;
                        field.magneticField.force.y = 0;
                        field.magneticField.force.x = -magneticFieldForce;
                        field.magneticField.lockXMovement = true;
                        field.magneticField.lockYMovement = false;
                        field.parented.offsetX = -fieldSize;
                        field.parented.offsetY = 30;
                    });
                    entity.velocity.x = -speed;
                } else {
                    entity.velocity.x = 0;
                }
            }

            if (Math.abs(entity.velocity.y) < 0.01) {
                entity.velocity.y = 0;
            }
            if (Math.abs(entity.velocity.x) < 0.01) {
                entity.velocity.x = 0;
            }
        }
    }
};