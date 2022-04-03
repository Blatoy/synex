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
    delete: () => void
    hasComponents: (components: typeof Component[]) => boolean
}