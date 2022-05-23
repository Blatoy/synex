import { Component } from "game-lib/types/component.js";

export class RigidBody extends Component {
    friction = 0;
    bounciness = 0;
    grounded = false;
    fallThrough = false;
}