
import { System } from "game-lib/types/system.js";
import { BASE_AUDIO_PATH } from "magnet-bros/paths.js";

export const spriteCache: { [key: string]: HTMLImageElement } = {};

// TODO: No state in systems!
let musicStarted = false;
export const CameraTrackerStart: System = {
    requiredComponents: [],
    update() {
        if (!musicStarted) {
            musicStarted = true;
            this.audio.play(BASE_AUDIO_PATH + "/" + "Mind-Bender-2.mp3");
        }
    }
};