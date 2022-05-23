import { ActionDefinition } from "game-lib/types/game-metadata.js";
import { Key } from "game-lib/utils/keycode.js";
import { Mouse, MousePosition } from "game-lib/utils/mouse.js";


export class EngineInput {
    private _ignoreInputs = false;

    private heldButtons: Set<Key> = new Set();

    private mouseClickedButtons: Set<Mouse> = new Set();
    private mouseUpButtons: Set<Mouse> = new Set();
    private mouseDownButtons: Set<Mouse> = new Set();

    private mouseCoordinates: MousePosition = { x: 0, y: 0 };

    constructor(private gameCanvas: HTMLCanvasElement) {
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));

        gameCanvas.addEventListener("click", this.onMouseClick.bind(this));
        gameCanvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        gameCanvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        gameCanvas.addEventListener("mousemove", this.onMouseMove.bind(this));

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

    private onMouseClick(mouse: MouseEvent) {
        if (this.ignoreInputs) {
            return;
        }
        this.mouseClickedButtons.add(mouse.button);
    }

    private onMouseMove(mouse: MouseEvent) {
        if (this.ignoreInputs) {
            return;
        }

        const rect = this.gameCanvas.getBoundingClientRect();
        const scaleX = this.gameCanvas.width / rect.width;
        const scaleY = this.gameCanvas.height / rect.height;
        this.mouseCoordinates = {
            x: (mouse.clientX - rect.left) * scaleX,
            y: (mouse.clientY - rect.top) * scaleY
        };
    }

    private onMouseDown(mouse: MouseEvent) {
        if (this.ignoreInputs) {
            return;
        }
        this.mouseDownButtons.add(mouse.button);
    }

    private onMouseUp(mouse: MouseEvent) {
        if (this.ignoreInputs) {
            return;
        }
        this.mouseUpButtons.add(mouse.button);
        this.mouseDownButtons.delete(mouse.button);
    }

    private onKeyUp(key: KeyboardEvent) {
        this.heldButtons.delete(key.code as Key);
    }

    public isHeld(key: Key) {
        return this.heldButtons.has(key);
    }

    public isMouseButtonClicked(button: Mouse) {
        return this.mouseClickedButtons.has(button);
    }

    public isMouseButtonDown(button: Mouse) {
        return this.mouseDownButtons.has(button);
    }

    public isMouseButtonUp(button: Mouse) {
        return this.mouseUpButtons.has(button);
    }

    public getMousePos(): MousePosition {
        return this.mouseCoordinates;
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

    public onFrameEnd() {
        this.mouseClickedButtons.clear();
        this.mouseUpButtons.clear();
    }

    public isMouseAction(action: ActionDefinition) {
        return action.mouseClick || action.mouseMove || action.mouseDown || action.mouseUp;
    }

    public performingAction(action: ActionDefinition) {
        const keyDown = action.keys.length === 0 || action.keys.some(key => this.isHeld(key));
        const mouseClicked = action.mouseClick ? action.mouseClick.some(mouse => this.isMouseButtonClicked(mouse)) : true;
        const mouseDown = action.mouseDown ? action.mouseDown.some(mouse => this.isMouseButtonDown(mouse)) : true;
        const mouseUp = action.mouseUp ? action.mouseUp.some(mouse => this.isMouseButtonUp(mouse)) : true;
        return keyDown && (action.mouseMove || (mouseClicked && mouseDown && mouseUp));
    }
}