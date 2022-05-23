import { Component } from "../types/component.js";
import { Color } from "../utils/color.js";

export class Debug extends Component {
    fillColor = new Color(255, 0, 0, 0.5);
    fillRect = false;
    strokeColor = new Color(255, 0, 0, 1);
    strokeRect = false;

    detailScroll = 0;
    showDetail = false;
    showName = false;
}