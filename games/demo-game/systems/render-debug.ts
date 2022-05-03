import { System } from "game-lib/types/system.js";
import { Entity } from "demo-game/metadata.js";
import { Debug } from "../components/debug.js";
import { Transform } from "../components/transform.js";

export const RenderDebugSystem: System = {
    requiredComponents: [Transform, Debug],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entities: Entity[]) {
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
                ctx.fillText(`${entity.transform.position.x.toFixed(2)},${entity.transform.position.y.toFixed(2)}`, position.x + size.x / 2, position.y + 200);
                // ctx.fillText(`(id=${entity.owner.id})`, position.x + size.x / 2, position.y - 40);
                ctx.textAlign = "left";
            }
            
            if (entity.health) {
                if (entity.health.amount < entity.health.maxAmount / 4) {
                    ctx.fillStyle = "orangered";
                } else {
                    ctx.fillStyle = "dodgerblue";
                }
                ctx.fillRect(position.x - entity.health.maxAmount / 2 + size.x / 2, position.y - 40, entity.health.amount, 30);
                ctx.strokeStyle = "darkblue";
                ctx.strokeRect(position.x - entity.health.maxAmount / 2 + size.x / 2, position.y - 40, entity.health.maxAmount, 30);
            }
        }
    }
};