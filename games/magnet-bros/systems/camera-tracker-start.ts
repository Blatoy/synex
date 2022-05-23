import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { TrackedEntity } from "magnet-bros/components/tracked-entity.js";
import { Entity } from "magnet-bros/metadata.js";

export const spriteCache: { [key: string]: HTMLImageElement } = {};

const extraDistanceFactor = 1.2;
const extraDistance = 100;
const maxZoom = 2.5;
const maxDezoom = 1;

const zoomInSpeed = 0.001;
const zoomOutSpeed = 0.02;
const translateSpeed = 0.1;
const borders = { x: 50, y: 50, x2: 1920 - 50, y2: 1080 - 50 };

const cameraTarget = { x: 1920 / 2, y: 1080 / 2 };
let zoomTarget = 1;

let canvasWidth = 1920;
let canvasHeight = 1080;

export const CameraTrackerStart: System = {
    requiredComponents: [Transform, TrackedEntity],
    update(entities: Entity[]) {

        // We don't want the camera to be rollback'ed
        if (this.meta.inRollback) {
            return;
        }

        let maxX = -Infinity;
        let maxY = -Infinity;
        let minX = Infinity;
        let minY = Infinity;

        if (entities.length <= 0) {
            return;
        }

        for (const entity of entities) {
            const pos = entity.transform.position;
            const size = entity.transform.size;

            if (pos.x < minX) {
                minX = pos.x;
            }
            if (pos.y < minY) {
                minY = pos.y;
            }
            if (pos.x + size.x > maxX) {
                maxX = pos.x + size.x;
            }
            if (pos.y + size.y > maxY) {
                maxY = pos.y + size.y;
            }
        }

        const distX = (maxX - minX) * extraDistanceFactor + extraDistance;
        const distY = (maxY - minY) * extraDistanceFactor + extraDistance;
        const maxZoomX = canvasWidth / distX;
        const maxZoomY = canvasHeight / distY;
        const zoomFactor = Math.max(maxDezoom, Math.min(maxZoomX, maxZoomY, maxZoom));

        if (zoomFactor > zoomTarget) {
            zoomTarget += (zoomFactor - zoomTarget) * zoomInSpeed;
        } else {
            zoomTarget += (zoomFactor - zoomTarget) * zoomOutSpeed;
        }

        cameraTarget.x += ((-(minX + maxX) * zoomTarget / 2 + canvasWidth / 2) - cameraTarget.x) * translateSpeed;
        cameraTarget.y += ((-(minY + maxY) * zoomTarget / 2 + canvasHeight / 2) - cameraTarget.y) * translateSpeed;
    },
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.save();
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        ctx.translate(
            Math.max(Math.min(cameraTarget.x, borders.x), borders.x2 - canvas.width * zoomTarget),
            Math.max(Math.min(cameraTarget.y, borders.y), borders.y2 - canvas.height * zoomTarget)
        );
        ctx.scale(zoomTarget, zoomTarget);
    }
};