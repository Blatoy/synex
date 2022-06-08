import { Component, SerializedComponent } from "game-lib/types/component.js";
import { GenericEntity, MetaEntity as MetaEntityInterface } from "game-lib/types/entity.js";
import { GameTemplate } from "game-template.js";

export class MetaEntity implements MetaEntityInterface {
    private _scheduledForDeletion = false;
    private scheduleComponents: SerializedComponent[] = [];

    constructor(
        public name: string,
        private _components: typeof Component[] = [],
        private entity: GenericEntity
    ) { }

    addComponent(...components: SerializedComponent[]) {
        for (const component of components) {
            GameTemplate.addSerializedComponent(this.entity, component);
        }
    }

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