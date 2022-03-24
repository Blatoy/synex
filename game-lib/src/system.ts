/* eslint-disable @typescript-eslint/no-empty-function */
import { Entity } from "game-entity.js";
import { Component } from "./component.js";

export class System {
    static requiredComponents: typeof Component[][] = [];

    updateAll(...entity: Entity[]) { }
    update(...entity: Entity[][]) { }
}