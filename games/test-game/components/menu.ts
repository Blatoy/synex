import { Component } from "game-lib/types/component.js";

export class Menu extends Component {
    index = 0;
    opened = false;
    names = ["Change Player Color ", "Replay from start", "Exit"];
}