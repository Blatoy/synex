import { Component } from "component.js";

export type SerializedComponent = {
    Type: typeof Component
    valuesOverride: { [key: string]: unknown } // TODO: Better typing
};

export interface Scene {
    metadata: {
        name: string
    }
    entities: {
        metadata: {
            name: string
        }
        components: SerializedComponent[]
    }[]
}