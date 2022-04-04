import { Component } from "game-lib/types/component.js";
import { Vector2 } from "game-lib/utils/vector2.js";

export class Force extends Component {
    acceleration = new Vector2();
}