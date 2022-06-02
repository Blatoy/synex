import { Scene } from "./scene.js";
import { System } from "./system.js";
import { Component } from "./component.js";
import { Key } from "utils/keycode.js";
import { Mouse } from "utils/mouse.js";

/**
 * Contains all the data required to load a game and additional information
 */
export type GameMetadata = {
    /**
     * List of systems
     * Systems must *not* be passed manually!
     * 
     * Use `SystemManager.createImporter(import.meta.url)` instead
     * 
     * If the importer is not used, systems will be cached by the browser and live reload will not work!
     */
    systems: System[];
    /**
     * Manually specify system names for debugging purposes
     * Required to use systemsHandlingEntity
     */
    systemNames: string[];
    /**
     * A map of name: Component
     * name is the name of what you will be able to access in systems (e.g. entity.transform)
     */
    components: { [key: string]: typeof Component };
    /**
     * List of scenes. The first scene is the default scene
     * WIP: other scenes cannot be loaded yet
     */
    scenes: Scene[]
    /**
     * Game version
     */
    version: string;
    /**
     * List of keyboard/mouse actions supported by this game. See ActionContexts
     */
    actions: ActionContexts
}

/**
 * List of contexts containing actions
 * default is always the first selected context
 * 
 * Useful to reuse the same keys for different actions (e.g. menu, world, map, etc.)
 */
export type ActionContexts = {
    "default": { [key: string]: ActionDefinition },
    [key: string]: { [key: string]: ActionDefinition }
}

export type ActionDefinition = {
    /**
     * Which keys can trigger this action
     */
    keys: Key[],
    /**
     * Which mouse buttons can be used to click
     */
    mouseClick?: Mouse[],
    /**
     * Which mouse buttons will trigger the event while held down
     */
    mouseDown?: Mouse[],
    /**
     * Which mouse buttons will trigger the event on release
     */
    mouseUp?: Mouse[],
    /**
     * Should this trigger when the mouse move?
     */
    mouseMove?: boolean,
    /**
     * Is this event automatically synchronized?
     * This should be used for menus or things that are only visible to the local player
     * actions.broadcast() can then be used to update the other players on what has been done locally (e.g. open menu, select item, use it) 
     * would only use broadcast for "use_item"
     * 
     * WARNING: When set to false, it will desync the game if it's used to update state that should be synchronized!
     */
    synchronized?: boolean
    /**
     * True if it does not trigger as long as the key is held
     */
    fireOnce?: boolean
}
