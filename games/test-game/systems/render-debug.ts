import { System } from "game-lib/types/system.js";
import { Menu } from "test-game/components/menu.js";
import { Owner } from "test-game/components/owner.js";
import { Entity } from "test-game/metadata.js";
import { Debug } from "../components/debug.js";
import { Transform } from "../components/transform.js";

export const RenderDebugSystem: System = {
    requiredComponents: [[Transform, Debug], [Transform, Owner], [Menu]],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entities: Entity[], ownedEntities: Entity[], menus: Entity[]) {
        ctx.fillStyle = "rgb(80, 80, 80)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const entity of entities) {
            const position = entity.transform.position;
            const size = entity.transform.size;

            if (entity.debug.fillRect) {
                ctx.fillStyle = entity.debug.fillColor.toString();
                ctx.fillRect(position.x, position.y, size.x, size.y);
            }

            if (entity.debug.strokeRect) {
                ctx.strokeStyle = entity.debug.strokeColor.toString();
                ctx.strokeRect(position.x, position.y, size.x, size.y);
            }

            // Using render instead of renderAll and separating fillRect, strokeRect and fillText into their own loop
            // improves performance a great deal and could be done if
            if (entity.debug.showName) {
                ctx.font = "32px monospace";
                ctx.fillStyle = `#${entity.debug.fillColor.toHex()}`;
                ctx.textAlign = "center";
                ctx.fillText(`${entity.transform.position.x},${entity.transform.position.y}`, position.x + size.x / 2, position.y - 10);
                ctx.textAlign = "left";
            }
        }

        if (menus) {
            for (const e of menus) {
                if (e.menu.opened) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                    ctx.fillRect(0, 0, 1920, 1080);
                    ctx.fillStyle = "rgb(250, 255, 255)";
                    ctx.font = "64px monospace";
                    ctx.textAlign = "center";
                    ctx.fillText("Game menu", 1920 / 2, 1080 / 2 - 100);
                    ctx.textAlign = "left";
                    ctx.font = "40px monospace";
                    for (let i = 0; i < e.menu.names.length; i++) {
                        const menuText = e.menu.names[i];
                        ctx.fillText((i === e.menu.index ? "> " : "  ") + menuText, 1920 / 2 - 240, 1080 / 2 + i * 60);
                    }
                }
            }
        }
    }
};