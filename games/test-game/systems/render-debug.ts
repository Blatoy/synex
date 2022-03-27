import { RequiresComponents } from "game-lib/component.js";
import { System } from "game-lib/system.js";
import { Entity } from "test-game/metadata.js";
import { Debug } from "../components/debug.js";
import { Transform } from "../components/transform.js";

export class RenderDebugSystem extends System {

    @RequiresComponents(Transform, Debug)
    renderAll(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entity: Entity) {
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

        if (entity.debug.showName) {
            ctx.fillStyle = entity.debug.fillColor.toString();
            ctx.fillText(entity.meta.name, position.x + size.x / 2, position.y - 10);
        }
    }
}