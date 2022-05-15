import { Transform } from "demo-game/components/transform.js";
import { System } from "game-lib/types/system.js";
import { MousePosition } from "game-lib/utils/mouse.js";
import { DemoSelected } from "demo-game/components/demo-selected.js";
import { Entity } from "demo-game/metadata.js";


export const DemoUpdate: System = {
    requiredComponents: [DemoSelected, Transform],
    update(entities: Entity[]) {
        const playerActions = this.actions.ofLocalPlayer();

        if (playerActions["default:debug_select"]) {
            const mousePos = playerActions["default:debug_select"].data as MousePosition;

            let anySelected = false;
            for (const e of entities) {
                const pos = e.transform.position;
                const size = e.transform.size;

                if (e.debug && e.demoSelected.selected) {
                    e.debug.strokeRect = false;
                }
                e.demoSelected.selected = false;

                if (!anySelected && mousePos.x > pos.x && mousePos.x < pos.x + size.x && mousePos.y > pos.y && mousePos.y < pos.y + size.y) {
                    e.demoSelected.selected = true;
                    if (e.debug) {
                        e.debug.strokeRect = true;
                    }
                    anySelected = true;
                }
            }
        }

    }
};