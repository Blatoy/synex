import { Debug } from "game-lib/base-components/debug.js";
import { Transform } from "game-lib/base-components/transform.js";
import { Component } from "game-lib/types/component.js";
import { System } from "game-lib/types/system.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { Entity } from "magnet-bros/metadata.js";

export const DemoRender: System = {
    requiredComponents: [[Transform, RadialMagneticField]],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, radialFields: Entity[]) {
        for (const entity of radialFields) {
            const pos = entity.transform.position;
            const size = entity.transform.size;
            if (entity.debug.fillRect) {
                ctx.beginPath();
                ctx.moveTo(pos.x + size.x / 2, pos.y + size.y / 2);
                ctx.ellipse(
                    pos.x + size.x / 2, pos.y + size.y / 2,
                    entity.radialField.radius,
                    entity.radialField.radius, 0, 0, 2 * Math.PI);
                ctx.fillStyle = entity.debug.fillColor.toString();
                ctx.closePath();
                ctx.fill();
            }
        }
    }
};