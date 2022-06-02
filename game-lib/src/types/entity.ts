import { Component } from "./component.js";

/**
 * Represent entities that are passed to systems
 */
export type GenericEntity = {
    meta: MetaEntity
    [key: string]: Component | unknown
}

export type MetaEntity = {
    /**
     * Name of the entity
     */
    name: string
    /**
     * List of components that the entity possess (useful for debug)
     */
    components: typeof Component[]
    /**
     * Mark this entity to be deleted on the next frame
     */
    delete: () => void
    /**
     * Return true if the entity has all of the specified components
     */
    hasComponents: (components: typeof Component[]) => boolean
}

/**
 * Should not be used by games!
 * TODO: Move to engine?
 */
export type SerializedEntity = {
    meta: {
        name: string,
        components: string[]
    }
    [key: string]: {
        [key: string]: unknown
    }
};