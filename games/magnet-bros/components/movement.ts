import { Component } from "game-lib/types/component.js";

export class Movement extends Component {
    acceleration = 5;
    jumpForce = -20;
    jumpTickLeft = 0;
    maxJumpTick = 20;

    movingLeft = false;
    movingRight = false;
    jumping = false;
}