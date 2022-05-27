import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Vector2 } from "game-lib/utils/vector2.js";
import { Camera } from "magnet-bros/components/camera.js";
import { TrackedEntity } from "magnet-bros/components/tracked-entity.js";
import { Entity } from "magnet-bros/metadata.js";
import { BASE_AUDIO_PATH } from "magnet-bros/paths.js";

export const spriteCache: { [key: string]: HTMLImageElement } = {};

let extraDistanceFactor: number;
let extraDistance: number;
let maxZoom: number;
let maxDezoom: number;
let zoomInSpeed: number;
let zoomOutSpeed: number;
let translateSpeed: number;
let borders: { x: number, y: number, x2: number, y2: number };

let cameraTarget = { x: 1920 / 2, y: 1080 / 2 };
let zoomTarget = 1;

let canvasWidth = 1920;
let canvasHeight = 1080;

let wasReset = true;

export const CameraTrackerStart: System = {
    requiredComponents: [[Transform, TrackedEntity], [Camera]],
    update(entities: Entity[], cameras: Entity[]) {
        // We don't want the camera to be rollback'ed
        // TODO: Once unsync components are supported, this won't be needed (?)
        if (this.meta.inRollback) {
            return;
        }

        if (wasReset && cameras[0].camera) {
            const camera = cameras[0].camera;
            extraDistanceFactor = camera.extraDistanceFactor;
            extraDistance = camera.extraDistance;
            maxZoom = camera.maxZoom;
            maxDezoom = camera.maxDezoom;
            zoomInSpeed = camera.zoomInSpeed;
            zoomOutSpeed = camera.zoomOutSpeed;
            translateSpeed = camera.translateSpeed;
            borders = camera.borders;
            wasReset = false;
            cameraTarget = camera.targetPosition;
            zoomTarget = camera.targetZoom;
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

        cameraTarget.x = Math.max(Math.min(cameraTarget.x, borders.x), borders.x2 - canvasWidth * zoomTarget);
        cameraTarget.y = Math.max(Math.min(cameraTarget.y, borders.y), borders.y2 - canvasHeight * zoomTarget);

        // TODO: Once "unsync" components can be created all of the logic should be done in the cameras
        // At the moment this has to be done to avoid shaky camera...
        for (const c of cameras) {
            const camera = c.camera;
            camera.targetZoom = zoomTarget;
            camera.targetPosition = new Vector2(cameraTarget.x, cameraTarget.y);
        }
    },
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        if (!cameraTarget || !borders) {
            return;
        }
        ctx.save();
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;


        ctx.translate(cameraTarget.x, cameraTarget.y);
        ctx.scale(zoomTarget, zoomTarget);
    }
};