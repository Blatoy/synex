import { SerializedComponent } from "types/component.js";
import { GenericEntity } from "types/entity.js";

export type Entities = {
    /**
     * Spawn (on next frame) an entity with a given list of components
     */
    spawn(name: string, ...components: SerializedComponent[]): void
    getByName(name: string): GenericEntity | undefined
}