import { System } from "game-lib/types/system.js";
import { Animation } from "magnet-bros/components/animation.js";
import { Sprite } from "magnet-bros/components/sprite.js";
import { Entity } from "magnet-bros/metadata.js";


export const UpdateAnimationSystem: System = {
    requiredComponents: [Animation, Sprite],
    updateAll(entity: Entity) {
        const animation = entity.animation;
        animation.animationTick++;

        if (animation.animationTick > animation.animationDelays[animation.selectedAnimation]) {
            animation.animationTick = 0;
            animation.frameIndex++;
            if (animation.frameIndex >= animation.animationsFrameCount[animation.selectedAnimation]) {
                animation.frameIndex = 0;
            }
        }

        entity.sprite.offsetX = (animation.selectedAnimationOffset + animation.frameIndex) * entity.sprite.width;
        /* entity.animation.currentTick++;
         if (entity.animation.currentTick > entity.animation.animationDelay) {
 
             entity.animation.currentOffset++;
             entity.animation.currentTick = 0;
 
             if (entity.animation.currentOffset > entity.animation.getCurrentFrameCount()) {
                 entity.animation.restartAnimation();
             }
         } */
    }
};