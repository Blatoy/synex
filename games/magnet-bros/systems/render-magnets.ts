import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { Entity } from "magnet-bros/metadata.js";

export const spriteCache: { [key: string]: HTMLImageElement } = {};

export const RenderMagnets: System = {
    requiredComponents: [Transform, RadialMagneticField],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, radials: Entity[]) {

        ctx.lineWidth = 2;
        for (const radial of radials) {
            if (!radial.radialField.active) {
                continue;
            }

            const pos = radial.transform.position;
            const size = radial.transform.size;
            const radius = radial.radialField.radius;

            const pulse = Math.abs(Math.sin(this.meta.tick * 0.03));
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.fillStyle = radial.radialField.backColor.toString();
            ctx.ellipse(pos.x + size.x / 2, pos.y + size.y / 2, radius - pulse, radius - pulse, 0, 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.fillStyle = "rgba(250, 250, 250, " + (0.05 + (pulse * 0.05)) + ")";
            ctx.ellipse(pos.x + size.x / 2, pos.y + size.y / 2, radius - pulse, radius - pulse, 0, 0, 2 * Math.PI);
            ctx.fill();

            const animatedRadius = (this.meta.tick * 5) % radius;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.fillStyle = "rgba(250, 250, 250, " + (0.1 - (animatedRadius / radius) * 0.1) + ")";
            ctx.ellipse(pos.x + size.x / 2, pos.y + size.y / 2, animatedRadius, animatedRadius, 0, 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = "rgba(250, 250, 250, " + (0.5 + (pulse * 0.05)) + ")";
            ctx.ellipse(pos.x + size.x / 2, pos.y + size.y / 2, radius - pulse, radius - pulse, 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
};