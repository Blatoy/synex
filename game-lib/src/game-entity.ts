import { Component } from "component.js";

export type Entity = ({ meta: GameEntity} & {[key: string]: Component});

export class GameEntity {
    constructor(public name: string) {}
}