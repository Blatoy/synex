import { Component } from "../types/component.js";
import { Color } from "../utils/color.js";

/**
 * Basic component that can be used for debugging
 * Check magnet-demo to see what can be done with this
 */
export class Debug extends Component {
    fillColor = new Color(255, 255, 0, 0.5);
    fillRect = false;
    strokeColor = new Color(255, 255, 0, 1);
    strokeRect = false;

    detailScroll = 0;
    showDetail = false;
    showName = false;
}