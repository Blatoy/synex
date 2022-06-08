import { SerializedComponent } from "./component.js";

export type EntityDefinition = {
        /**
         * Name of the entity
         */
         metadata: {
            name: string
        }
        /**
         * Serialized components that makes this entity
         */
        components: SerializedComponent[]
}

/**
 * Default scene state, this is what is saved in a game project
 */
export type Scene = {
    metadata: {
        /**
         * Name of the scene
         */
        name: string
    }
    entities: EntityDefinition[]
}