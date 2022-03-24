import { Component } from "component.js";
import { Scene } from "scene.js";
import { System } from "system.js";

export interface GameDefinition {
    systems: typeof System[];
    components: {[key: string]: typeof Component};
    scenes: Scene[]
    version: string;
}