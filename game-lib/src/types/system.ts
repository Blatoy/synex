import { Component } from "./component.js";
import { GenericEntity } from "./entity.js";

/**
 * Defines game logic, should not contain state!
 */
export type System = {
    requiredComponents: typeof Component[] | typeof Component[][];

    updateAll?(entity: GenericEntity): void;
    update?(...entity: GenericEntity[][]): void;
    renderAll?(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entity: GenericEntity): void;
    render?(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ...entity: GenericEntity[][]): void;
}
