import { Component } from "game-lib/types/component.js";

export class Sprite extends Component {
    sheetURL = "";
    name = "";

    offsetX = 0;
    offsetY = 0;
    width = 0;
    height = 0;

    parallax = 0;

    mirrorX = false;
}