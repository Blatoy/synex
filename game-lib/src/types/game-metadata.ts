import { Scene } from "./scene.js";
import { System } from "./system.js";
import { Component } from "./component.js";
import { Key } from "utils/keycode.js";
import { Mouse } from "utils/mouse.js";

/**
 * Contains all the data required to load a game and additional information
 */
export type GameMetadata = {
    systems: System[];
    systemNames: string[]; // This is only required as we want to showcase ECS
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
    mouseClick?: Mouse[],
    mouseDown?: Mouse[],
    mouseUp?: Mouse[],
    mouseMove?: boolean,
    synchronized?: boolean
    fireOnce?: boolean
}
