import { Key } from "game-lib/utils/keycode.js";

export class EngineInput {
    private _ignoreInputs = false;

    private heldButtons: Set<Key> = new Set();

    constructor() {
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
        document.addEventListener("blur", () => {
            this.heldButtons.clear();
        });
    }

    private onKeyDown(key: KeyboardEvent) {
        if (this.ignoreInputs) {
            return;
        }
        this.heldButtons.add(key.code as Key);
    }

    private onKeyUp(key: KeyboardEvent) {
        this.heldButtons.delete(key.code as Key);
    }

    public isHeld(key: Key) {
        return this.heldButtons.has(key);
    }

    public clearHeld(key: Key) {
        this.heldButtons.delete(key);
    }

    public get ignoreInputs() {
        return this._ignoreInputs;
    }

    public set ignoreInputs(value) {
        this._ignoreInputs = value;
        if (value) {
            this.heldButtons.clear();
        }
    }
}