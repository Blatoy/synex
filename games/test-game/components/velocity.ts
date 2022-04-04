import { Component } from "game-lib/types/component.js";
import { Vector2 } from "game-lib/utils/vector2.js";

export class Velocity extends Component {
    linear = new Vector2();
    angular = new Vector2();
}