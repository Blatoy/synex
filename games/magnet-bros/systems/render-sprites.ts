import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Sprite } from "magnet-bros/components/sprite.js";
import { Entity } from "magnet-bros/metadata.js";

export const spriteCache: { [key: string]: HTMLImageElement } = {};

export const RenderSprite: System = {
    requiredComponents: [Transform, Sprite],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, sprites: Entity[]) {
        ctx.imageSmoothingEnabled = false;
        for (const sprite of sprites) {
            const pos = sprite.transform.position;
            const size = sprite.transform.size;
            const spriteName = sprite.sprite.name;

            if (!spriteCache[spriteName]) {
                spriteCache[spriteName] = new Image();
                spriteCache[spriteName].src = sprite.sprite.sheetURL;
            }

            const image = spriteCache[spriteName];
            if (image.complete) {
                if (sprite.sprite.mirrorX) {
                    ctx.save();
                    ctx.translate(sprite.transform.position.x, 0);
                    ctx.scale(-1, 1);

                    ctx.drawImage(image,
                        sprite.sprite.offsetX, sprite.sprite.offsetY,
                        sprite.sprite.width, sprite.sprite.height,
                        -size.x, pos.y,
                        size.x, size.y);

                    ctx.scale(-1, 1);
                    ctx.translate(-sprite.transform.position.x, 0);
                    ctx.restore();
                } else {
                    const transform = ctx.getTransform();
                    const tx = -pos.x - size.x / 2 + ((-transform.e + pos.x + size.x / 2) / transform.a);
                    const ty = -pos.y - size.y / 2 + ((-transform.f + pos.y + size.y / 2) / transform.d);

                    ctx.drawImage(image,
                        sprite.sprite.offsetX, sprite.sprite.offsetY,
                        sprite.sprite.width, sprite.sprite.height,
                        pos.x + tx * sprite.sprite.parallax, pos.y + ty * sprite.sprite.parallax,
                        size.x, size.y);
                }
            }
        }
    }
};