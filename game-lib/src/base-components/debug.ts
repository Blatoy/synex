import { Component } from "../types/component.js";
import { Color } from "../utils/color.js";

export class Debug extends Component {
    fillColor = new Color(255, 0, 0, 0.5);
    fillRect = true;
    strokeColor = new Color(255, 0, 0, 1);
    strokeRect = false;

    showDetail = false;
    showName = false;
}