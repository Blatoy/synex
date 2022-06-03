import { Component } from "game-lib/types/component.js";

export class Animation extends Component {
    // Animation config could be static
    spriteSheet = "../../assets/demo-game/images/player.png";
    spriteName = "player";
    spriteWidth = 16;
    spriteHeight = 32;

    animationsFrameCount = [8, 2, 1, 1, 3, 1, 9, 6];
    animationsName = ["run", "idle", "skid", "jumpStart", "zip", "jumpEnd", "door", "death"];
    animationDelay = 6;

    currentAnimationIndex = 0;
    currentOffset = 0;
    currentTick = 0;

    facingRight = true;

    setAnimation(name: string) {
        const index = this.animationsName.indexOf(name);

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
}