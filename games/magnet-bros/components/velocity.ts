import { Vector2 } from "game-lib/utils/vector2.js";
import { Component } from "game-lib/types/component.js";

export class Velocity extends Component {
    linear = new Vector2();
    maxLinear = new Vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    minLinear = new Vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    angular = 0;
    maxAngular = 0;
}