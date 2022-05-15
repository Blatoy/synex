import { Component } from "game-lib/types/component.js";

export enum SpawnerType {
    PLAYER
}

export class Spawner extends Component {
    type = SpawnerType.PLAYER;
}