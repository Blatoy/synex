import { Debug } from "game-lib/base-components/debug.js";
import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { MousePosition } from "game-lib/utils/mouse.js";
import { Entity } from "magnet-bros/metadata.js";


export const UpdateDebug: System = {
    requiredComponents: [Transform, Debug],
    update(entities: Entity[]) {
        const playerActions = this.actions.ofLocalPlayer();

        if (playerActions["default:debug_select"]) {
            const mousePos = playerActions["default:debug_select"].data as MousePosition;

            let anySelected = false;
            for (const entity of entities) {
                // Reset status of all
                const wasSelected = entity.debug.showDetail;
                entity.debug.strokeRect = false;
                entity.debug.showDetail = false;

                if (!wasSelected && !anySelected && entity.transform.containsPoint(mousePos.x, mousePos.y)) {
                    anySelected = true;
                    entity.debug.strokeRect = true;
                    entity.debug.showDetail = true;
                }

            }
        }

        for (const entity of entities) {
            if (entity.debug.showDetail) {
                if (playerActions["default:debug_scroll_down"]) {
                    entity.debug.detailScroll++;
                } else if (playerActions["default:debug_scroll_up"]) {
                    entity.debug.detailScroll--;
                    if (entity.debug.detailScroll < 0) {
                        entity.debug.detailScroll = 0;
                    }
                }
            }
        }
    }
};