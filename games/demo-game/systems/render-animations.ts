import { System } from "game-lib/types/system.js";
import { Entity } from "../metadata.js";
import { Animation } from "../components/animation.js";
import { Transform } from "../components/transform.js";

const spriteCache: { [key: string]: HTMLImageElement } = {};

export const RenderAnimationSystem: System = {
    requiredComponents: [Transform, Animation],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entities: Entity[]) {
        ctx.imageSmoothingEnabled = false;
        // sort by y position
        const sortedEntities = entities.sort((a: Entity, b: Entity) => a.transform.position.y - b.transform.position.y);
        for (const entity of sortedEntities) {
            if (!spriteCache[entity.animation.spriteName]) {
                spriteCache[entity.animation.spriteName] = new Image();
                spriteCache[entity.animation.spriteName].src = entity.animation.spriteSheet;
            }

            const image = spriteCache[entity.animation.spriteName];
            if (image.complete) {
                const position = entity.transform.position;
                const size = entity.transform.size;

                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.beginPath();
                ctx.moveTo(position.x + size.x / 2, position.y + size.y);
                ctx.ellipse(position.x + size.x / 2, position.y + size.y, size.x / 2, size.x / 8, 0, 0, Math.PI * 2);
                ctx.fill();

                if (entity.animation.facingRight) {
                    ctx.save();
                    ctx.translate(entity.transform.position.x, 0);
                    ctx.scale(-1, 1);

                    ctx.drawImage(image,
                        entity.animation.getSpriteOffset(), 0,
                        entity.animation.spriteWidth, entity.animation.spriteHeight,
                        -size.x, position.y,
                        size.x, size.y);

                    ctx.scale(-1, 1);
                    ctx.translate(-entity.transform.position.x, 0);
                } else {
                    ctx.drawImage(image,
                        entity.animation.getSpriteOffset(), 0,
                        entity.animation.spriteWidth, entity.animation.spriteHeight,
                        entity.transform.position.x, entity.transform.position.y,
                        entity.transform.size.x, entity.transform.size.y);
                }
            }
        }
    }
};