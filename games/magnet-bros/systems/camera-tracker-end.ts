import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { TrackedEntity } from "magnet-bros/components/tracked-entity.js";
import { Entity } from "magnet-bros/metadata.js";

export const spriteCache: { [key: string]: HTMLImageElement } = {};

export const CameraTrackerEnd: System = {
    requiredComponents: [Transform, TrackedEntity],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entities: Entity[]) {
        ctx.restore();
    }
};