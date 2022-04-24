import { Actions } from "./game-api/action.js";
import { Component } from "./component.js";
import { GenericEntity } from "./entity.js";
import { Entities } from "./game-api/entities.js";

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
    entities: Entities
}