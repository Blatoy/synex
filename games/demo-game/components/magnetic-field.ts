import { Component } from "game-lib/types/component.js";
import { Vector2 } from "game-lib/utils/vector2.js";

export class MagneticField extends Component {
    force = new Vector2();
    lockXMovement = false;
    lockYMovement = false;
}