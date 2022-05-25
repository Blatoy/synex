import { Engine } from "engine.js";
import { Audio as AudioDefinition } from "game-lib/types/game-api/audio.js";

export class AudioAPI implements AudioDefinition {
    private allSounds: HTMLAudioElement[] = [];
    private soundTemplates: { [key: string]: HTMLAudioElement } = {};
    private _muted = true;
    private audioEnabled = false;

    constructor(private engine: Engine) { }

    public get muted() {
        return this._muted;
    }
    public set muted(value) {
        for (const sound of this.allSounds) {
            if (value) {
                sound.volume = 0;
            } else {
                sound.volume = 0.5;
            }
        }
        this._muted = value;
    }

    async getSound(audioPath: string): Promise<HTMLAudioElement> {
        if (this.soundTemplates[audioPath]) {
            return this.soundTemplates[audioPath].cloneNode() as HTMLAudioElement;
        } else {
            this.soundTemplates[audioPath] = new Audio();
            this.soundTemplates[audioPath].src = audioPath;
            return new Promise((resolve, reject) => {
                this.soundTemplates[audioPath].addEventListener("canplay", () => {
                    resolve(this.soundTemplates[audioPath]);
                });
            });
        }
    }

    async play(audioPath: string) {
        // TODO: Should have more smart audio or it won't play if the player has lag
        if (this.engine.metaAPI.inRollback) {
            return;
        }

        const sound = await this.getSound(audioPath);
        sound.loop = true;

        this.allSounds.push(sound);
        if (this.muted) {
            sound.volume = 0;
        }

        if (this.audioEnabled) {
            sound.play();
        }
    }

    async playOnce(audioPath: string) {
        // TODO: Should have more smart audio or it won't play if the player has lag
        if ((this.engine.metaAPI.inRollback || !this.audioEnabled)) {
            return;
        }

        const sound = await this.getSound(audioPath);

        this.allSounds.push(sound);
        if (this.muted) {
            sound.volume = 0;
        }

        sound.play();
        sound.addEventListener("ended", () => {
            this.allSounds.splice(this.allSounds.indexOf(sound), 1);
        });
    }

    // TODO
    stop(audioPath: string) {
        if (this.engine.metaAPI.inRollback) {
            return;
        }
    }

    enableAudio() {
        if (this.audioEnabled) {
            return;
        }

        this.audioEnabled = true;

        for (const sound of this.allSounds) {
            sound.play();
        }
    }

}