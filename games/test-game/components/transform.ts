import { Component } from "game-lib/types/component.js";
import { Vector2 } from "game-lib/utils/vector2.js";

export class Transform extends Component {
    position = new Vector2();
    size = new Vector2(100, 100);
    rotation = new Vector2();
}