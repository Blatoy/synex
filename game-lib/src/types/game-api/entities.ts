import { SerializedComponent } from "types/component.js";

export type Entities = {
    /**
     * Spawn (on next frame) an entity with a given list of components
     */
    spawn(name: string, ...components: SerializedComponent[]): void
}