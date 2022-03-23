import { Component } from "component.js";
import { System } from "system.js";

export interface GameMetadata {
    systems: typeof System[];
    components: {[key: string]: typeof Component};
}