import { Scene } from "./scene.js";
import { System } from "./system.js";
import { Component } from "./component.js";

/**
 * Contains all the data required to load a game and additional information
 */
export type GameMetadata = {
    systems: System[];
    components: { [key: string]: typeof Component };
    scenes: Scene[]
    version: string;
}