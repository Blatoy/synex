import { System } from "game-lib/types/system.js";
import { Color } from "game-lib/utils/color.js";
import { Menu } from "test-game/components/menu.js";
import { Owner } from "test-game/components/owner.js";
import { Entity } from "test-game/metadata.js";

export const MoveSystem: System = {
    requiredComponents: [Menu, Owner],
    updateAll(entity: Entity) {
        const playerActions = this.actions.ofPlayer(entity.owner.id);

        if (playerActions["default:open_menu"]) {
            this.actions.setContext("menu");
            entity.menu.opened = true;
        }

        if (playerActions["menu:close_menu"]) {
            this.actions.setContext("default");
            entity.menu.opened = false;
        }

        if (playerActions["menu:right"]) {
            entity.menu.index++;
        }
        if (playerActions["menu:left"]) {
            entity.menu.index--;
        }
        if (playerActions["menu:enter"]) {
            switch (entity.menu.index) {
                case 0: {
                    const c = new Color(entity.transform.position.x % 255, entity.transform.position.y % 255, entity.transform.position.x % 255, 0.8);
                    entity.debug.fillColor = c;
                    entity.debug.strokeColor = c;
                } break;
                case 1: {
                    (window as any).engines[0].replayIndex = 0;
                }
                    break;
                case 2:
                    entity.menu.opened = false;
                    this.actions.setContext("default");
                    break;
            }
        }

        entity.menu.index = Math.max(Math.min(entity.menu.index, entity.menu.names.length - 1), 0);
    }
};