import { Component, SerializedComponent } from "types/component.js";

export type Entities = {
    spawn(name: string, ...components: SerializedComponent[]): void
}