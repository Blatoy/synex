import { Component } from "game-lib/component.js";
import { Color } from "game-lib/utils/color.js";

export class Debug extends Component {
    fillColor = new Color(255, 0, 0, 0.1);
    strokeColor = new Color(255, 0, 0, 1);
    showName = false;
    fillRect = false;
    strokeRect = true;
}