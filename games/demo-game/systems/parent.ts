import { System } from "game-lib/types/system.js";
import { Owner } from "../components/owner.js";
import { Entity } from "../metadata.js";

import { Velocity } from "../components/velocity.js";
import { Magnetic } from "demo-game/components/magnetic.js";
import { Parented } from "demo-game/components/parented.js";
import { Transform } from "demo-game/components/transform.js";
import { Parent } from "demo-game/components/parent.js";

export const ParentSystem: System = {
    requiredComponents: [[Parent, Transform], [Parented, Transform]],
    update(parents: Entity[], children: Entity[]) {
        for (const parent of parents) {
            for (const child of children) {
                if (parent.parent.id === child.parented.parentId) {
                    child.transform.position.x = parent.transform.position.x + child.parented.offsetX;
                    child.transform.position.y = parent.transform.position.y + child.parented.offsetY;
                }
            }
        }
    }
};