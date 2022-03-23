/* eslint-disable @typescript-eslint/no-empty-function */
import { GameEntity } from "game-entity.js";
import { Component } from "./component.js";

type Entity = ({ meta: GameEntity} & {[key: string]: Component});

export class System {
    static requiredComponents: typeof Component[][] = [];

    updateAll(...entity: Entity[]) { }
    update(...entity: Entity[][]) { }
}