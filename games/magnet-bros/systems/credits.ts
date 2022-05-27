import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";

export type RespawnParameters = {
    owner: string
};

export const CreditsSystem: System = {
    requiredComponents: [],
    update() {
        const playerActions = this.actions.ofLocalPlayer();

        if (playerActions["default:open_menu"]) {
            this.actions.setContext("menu");
        }
        if (playerActions["menu:close"]) {
            this.actions.setContext("default");
        }
    }
};