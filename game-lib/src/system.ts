
import { Entity } from "game-entity.js";
import { Component } from "./component.js";

export class System {
    static requiredComponents: typeof Component[][] = [];

    get requiredComponents() {
        return (this.constructor as typeof System).requiredComponents; 
    }

    updateAll?(...entity: Entity[]): void;
    update?(...entity: Entity[][]): void;
    renderAll?(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ...entity: Entity[]): void;
    render?(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ...entity: Entity[][]): void;
}
