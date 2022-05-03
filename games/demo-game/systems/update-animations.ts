import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";

import { Animation } from "../components/animation.js";


export const UpdateAnimationSystem: System = {
    requiredComponents: [Animation],
    updateAll (entity: Entity) {
        entity.animation.currentTick++;
        if (entity.animation.currentTick > entity.animation.animationDelay) {
            
            entity.animation.currentOffset++;
            entity.animation.currentTick = 0;

            if (entity.animation.currentOffset > entity.animation.getCurrentFrameCount()) {
                entity.animation.restartAnimation();
            }
        }
    }
};