import { System } from "game-lib/types/system.js";
import { Entity } from "../metadata.js";
import { Transform } from "../components/transform.js";

export const RenderAnimationSystem: System = {
    requiredComponents: [Transform],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entities: Entity[]) {
        ctx.fillStyle = "rgb(90, 90, 80)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};