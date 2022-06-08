import { Component } from "game-lib/types/component.js";
import { Vector2 } from "game-lib/utils/vector2.js";

export class Camera extends Component {
    extraDistanceFactor = 1.2;
    extraDistance = 100;
    maxZoom = 1.5;
    maxDezoom = 1;

    zoomInSpeed = 0.001;
    zoomOutSpeed = 0.02;
    translateSpeed = 0.1;
    borders = { x: 50, y: 50, x2: 1920 - 50, y2: 1080 - 50 };

    targetPosition = new Vector2(1920 / 2, 1080 / 2);
    targetZoom = 1;
}