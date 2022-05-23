import { System } from "game-lib/types/system.js";
import { Color } from "game-lib/utils/color.js";
import { MousePosition } from "game-lib/utils/mouse.js";
import { Menu } from "test-game/components/menu.js";
import { Owner } from "test-game/components/owner.js";
import { Entity } from "test-game/metadata.js";

type RGB = { r: number, g: number, b: number };

export const MenuSystem: System = {
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
        if (playerActions["default:teleport_player"]) {
            const mousePos = playerActions["default:teleport_player"].data as MousePosition;

            entity.transform.position.x = mousePos.x;
            entity.transform.position.y = mousePos.y;
        }

        if (playerActions["menu:set_color"]) {
            const color = playerActions["menu:set_color"].data as RGB;
            const c = new Color(color.r, color.g, color.b, 0.8);

            entity.debug.fillColor = c;
            entity.debug.strokeColor = c;
        }

        if (playerActions["menu:enter"]) {
            switch (entity.menu.index) {
                case 0: {

                    const color: RGB = {
                        r: entity.transform.position.x % 255,
                        g: entity.transform.position.y % 255,
                        b: entity.transform.position.x % 255
                    };

                    this.actions.broadcast("set_color", color);
                } break;
                case 1: 
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