import { Component } from "game-lib/types/component.js";
import { MetaEntity as MetaEntityInterface } from "game-lib/types/entity.js";

export class MetaEntity implements MetaEntityInterface {
    private _scheduledForDeletion = false;

    constructor(public name: string, private _components: typeof Component[] = []) { }

    delete() {
        this._scheduledForDeletion = true;
    }

    hasComponents(components: typeof Component[]) {
        return components.every(component => this.components.includes(component));
    }

    // Used when saving frame states, should probably be optimized or done in a better way?
    toJSON() {
        return {
            name: this.name,
            components: this.components.map(component => component.componentName)
        };
    }

    get components() {
        return this._components;
    }

    get scheduledForDeletion() {
        return this._scheduledForDeletion;
    }
}