import { Component } from "./component.js";

/**
 * Represent entities that are passed to systems
 */
export type GenericEntity = {
    meta: MetaEntity
    [key: string]: Component | unknown
}

export type MetaEntity = {
    name: string
    components: typeof Component[] // TODO: Should this be here?
    delete: () => void
    hasComponents: (components: typeof Component[]) => boolean // TODO: Should this be here?
}

export type SerializedEntity = {
    meta: {
        name: string,
        components: string[]
    }
    [key: string]: {
        [key: string]: unknown
    }
};