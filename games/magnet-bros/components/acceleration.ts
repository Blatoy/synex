import { Vector2 } from "game-lib/utils/vector2.js";
import { Component } from "game-lib/types/component.js";

export class Acceleration extends Component {
    linear = new Vector2();
    linearFriction = new Vector2(1, 1);
    angular = 0;
    angularFriction = 0;
}