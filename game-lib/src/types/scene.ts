import { SerializedComponent } from "./component.js";

/**
 * Default scene state, this is what is saved in a game project
 */
export type Scene = {
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