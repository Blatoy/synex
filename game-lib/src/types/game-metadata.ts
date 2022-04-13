import { Scene } from "./scene.js";
import { System } from "./system.js";
import { Component } from "./component.js";
import { Key } from "utils/keycode.js";

/**
 * Contains all the data required to load a game and additional information
 */
export type GameMetadata = {
    systems: System[];
    components: { [key: string]: typeof Component };
    scenes: Scene[]
    version: string;
    actions: ActionContexts
}

export type ActionContexts = {
    "default": {[key: string]: ActionDefinition},
    [key: string]: {[key: string]: ActionDefinition}
}

export type ActionDefinition = {
    keys: Key[],
    synchronized?: boolean
    fireOnce?: boolean
}
