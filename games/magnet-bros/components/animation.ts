import { Component } from "game-lib/types/component.js";

export class Animation extends Component {
    animationsFrameCount = [8, 2, 1, 1, 3, 1, 9, 6];
    animationDelays = [6, 12, 1, 1, 10, 1, 16, 16];
    animationsName = ["run", "idle", "skid", "jumpStart", "zip", "jumpEnd", "door", "death"];

    selectedAnimation = 0;
    selectedAnimationOffset = 0;
    frameIndex = 0;
    animationTick = 0;

    setAnimation(name: string) {
        const index = this.animationsName.indexOf(name);

        if (this.selectedAnimation !== index) {
            this.selectedAnimationOffset = 0;
            this.selectedAnimation = index;
            this.frameIndex = 0;
            this.animationTick = 0;

            for (let i = 0; i < index; i++) {
                this.selectedAnimationOffset += this.animationsFrameCount[i];
            }
        }
    }
    /*
        setAnimation(name: string) {
    
    
            if (this.currentAnimationIndex !== index) {
                let frameIndex = 0;
                for (let i = 0; i < index; i++) {
                    frameIndex += this.animationsFrameCount[i];
                }
                
                this.currentAnimationIndex = frameIndex;
                this.restartAnimation();
            }
        }
    
        restartAnimation() {
            this.currentOffset = 0;
            this.currentTick = 0;
        }
    
        getSpriteOffset() {
            return (this.currentAnimationIndex + this.currentOffset) * this.spriteWidth;
        }
    
    
        getCurrentFrameCount() {
            return this.animationsFrameCount[this.currentAnimationIndex];
        }
        */
}