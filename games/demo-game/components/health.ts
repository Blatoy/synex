import { Component } from "game-lib/types/component.js";

export class Health extends Component {
    amount = 100;
    maxAmount = 100;
    invulFrame = 5;
}