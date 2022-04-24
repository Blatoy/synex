import { Component } from "types/component.js";

export type Entities = {
    spawn(...components: Component[]): void
}