import { Component } from "game-lib/types/component.js";
import { Color } from "game-lib/utils/color.js";

export class RadialMagneticField extends Component {
    radius = 200;
    force = 1000;
    active = true;

    backColor = new Color(0, 0, 0, 0);
}