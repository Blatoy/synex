import { Actions } from "./action.js";
import { Component } from "./component.js";
import { GenericEntity } from "./entity.js";

/**
 * Defines game logic, should not contain state!
 */
export type System = {
    requiredComponents: typeof Component[] | typeof Component[][];

    updateAll?(this: SystemContext, entity: GenericEntity): void;
    update?(this: SystemContext, ...entity: GenericEntity[][]): void;
    renderAll?(this: SystemContext, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entity: GenericEntity): void;
    render?(this: SystemContext, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ...entity: GenericEntity[][]): void;
}

export type SystemContext = {
    actions: Actions
}