


import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Vector2 } from "game-lib/utils/vector2.js";
import { Transform } from "game-lib/base-components/transform.js";

export const LifetimeSystem: System = {
    requiredComponents: [Transform],
    updateAll(entity: Entity) {
        if (this.actions.byType("default", "demo_1").length > 0) {
            if (entity.meta.name === "Center platform") {
                entity.meta.addComponent({
                    Type: Velocity,
                    valuesOverride: {
                        linear: new Vector2(1, 0)
                    } as Velocity
                });
            }
        }
    }
};