import { Component } from "game-lib/component.js";
import { Entity, GameEntity } from "game-lib/game-entity.js";
import { GameDefinition } from "game-lib/metadata.js";
import { Scene } from "game-lib/scene.js";

export class Game {
    definition: GameDefinition = { components: {}, systems: [], scenes: [], version: "" };

    constructor(private basePath: string) { }

    async load() {
        this.definition = (await import(`${this.basePath}/metadata.js?r=${Math.random()}&basePath=${this.basePath}`)).gameDefinition as GameDefinition;
        this.assignNameToComponents();
    }

    /**
     * Set component names at runtime so the game dev does not have to set it twice
     * In the future it would be neat to have the name set directly on the Component using a decorator
     * However doing so makes it more complicated / impossible to have nice autocomplete
     */
    private assignNameToComponents() {
        for (const componentName in this.definition.components) {
            this.definition.components[componentName].componentName = componentName;
        }
    }

    findSceneByName(name: string) {
        return this.definition.scenes.find(scene => scene.metadata.name === name);
    }

    getMainScene() {
        return this.definition.scenes[0];
    }

    getSystems() {
        return this.definition.systems;
    }

    loadInitialSceneState(scene: Scene) {
        const entities: Entity[] = [];

        scene.entities.forEach((entityDefinition) => {
            const entity: Entity = { meta: new GameEntity(entityDefinition.metadata.name) };

            entityDefinition.components.forEach((component) => {
                entity[component.Type.componentName] = Component.deserialize(component);
            });

            entities.push(entity);
        });

        return entities;
    }
}