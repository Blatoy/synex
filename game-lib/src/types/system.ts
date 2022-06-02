import { Actions } from "./game-api/action.js";
import { Component } from "./component.js";
import { GenericEntity } from "./entity.js";
import { Entities } from "./game-api/entities.js";
import { Meta } from "./game-api/meta.js";
import { Audio } from "./game-api/audio.js";

/**
 * Defines game logic, should not contain state!
 */
export type System = {
    /**
     * List of components components that an entity must have to be passed to this system
     * It's possible to pass a list of list of components to obtain multiple entities list at once
     * in which case the order matter as it's the same order that will be passed in the update/render
     * 
     * If passing a list of list of components, <i>updateAll</i> and <i>renderAll</i> will contain mixed entities and as such should be avoided
     * 
     * @example Simple query and updateAll
     * ```ts
     * requiredComponents: [Transform, Velocity],
     * updateAll(entity: Entity): void; // entity is one entity that contains both Transform and Velocity components
     * ```
     * 
     * @example Colliders and RigidBodies collisions
     * ```ts
     * requiredComponents: [[Transform, Collider], [Transform, Rigidbody]],
     * update(colliders: Entity[], rigidBodies: Entity[]): void; // colliders is a list of entity that contains both Transform and Collider, rigidBodies
     * is a list of entity that contains both Transform and Rigidbody 
     * ```
     */
    requiredComponents: typeof Component[] | typeof Component[][];
    /**
     * Called once per entity that matches requiredComponents
     * Should be used to update the game
     * Called at a fixed rate
     * 
     * No need for manual loop
     * Great for small systems
     */
    updateAll?(this: SystemContext, entity: GenericEntity): void;
    /**
     * Should be used to update the game
     * Called at a fixed rate
     * 
     * Called once per update. Need to loop manually on entities.
     * Support multiple list of entities (see requiredComponents)
     */
    update?(this: SystemContext, ...entity: GenericEntity[][]): void;
    /**
     * Must NOT change synchronized component state! Should be used to render the game
     * Called as fast as possible (usually capped at the screen refresh rate)
     * 
     * Called once per entity that matches requiredComponents
     * No need for manual loop
     * Great for small systems
     */
    renderAll?(this: SystemContext, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entity: GenericEntity): void;
    /**
     * Must NOT change synchronized component state! Should be used to render the game
     * Called as fast as possible (usually capped at the screen refresh rate)
     * 
     * Called once per update. Need to loop manually on entities.
     * Support multiple list of entities (see requiredComponents)
     */
    render?(this: SystemContext, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, ...entity: GenericEntity[][]): void;
}

export type SystemContext = {
    /**
     * Actions that were performed on this frame
     * @see Actions
     */
    actions: Actions
    /**
     * Entity API
     * @see Entities
     */
    entities: Entities
    /**
     * Meta API
     * @see Meta
     */
    meta: Meta
    /**
     * Audio API
     * @see Audio
     */
    audio: Audio
}