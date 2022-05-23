import { Component } from "game-lib/types/component.js";

export class BoxCollider extends Component {
    bounciness = 0;
    collisions = {
        left: true,
        right: true,
        top: true,
        bottom: true
    };
}