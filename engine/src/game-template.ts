import { ComponentManager } from "game-lib/utils/component-manager.js";
import { GenericEntity } from "game-lib/types/entity.js";
import { GameMetadata } from "game-lib/types/game-metadata.js";
import { Scene } from "game-lib/types/scene.js";
import { MetaEntity } from "meta-entity.js";

export class GameTemplate {
    gameMetadata!: GameMetadata;

    constructor(private basePath: string) { }

    async load() {
        await this.reload();
    }
    async reload() {
        this.gameMetadata = (await import(`${this.basePath}/metadata.js?r=${Math.random()}&basePath=${this.basePath}`)).gameDefinition as GameMetadata;
        this.assignNameToComponents();
    }

    /**
     * Set component names at runtime so the game dev does not have to set it twice
     * In the future it would be neat to have the name set directly on the Component
     * However doing so makes it more complicated / impossible to have nice autocomplete
     */
    private assignNameToComponents() {
        for (const componentName in this.gameMetadata.components) {
            this.gameMetadata.components[componentName].componentName = componentName;
        }
    }

    findSceneByName(name: string) {
        return this.gameMetadata.scenes.find(scene => scene.metadata.name === name);
    }

    get mainScene() {
        return this.gameMetadata.scenes[0];
    }

    get systems() {
        return this.gameMetadata.systems;
    }

    loadScene(scene: Scene) {
        const entities: GenericEntity[] = [];

        for (const entityDefinition of scene.entities) {
            const entity: GenericEntity = {
                meta: new MetaEntity(
                    entityDefinition.metadata.name,
                    entityDefinition.components.map(serializedComponent => serializedComponent.Type)
                )
            };

            entityDefinition.components.forEach((component) => {
                entity[component.Type.componentName] = ComponentManager.deserialize(component);
            });

            entities.push(entity);
        }

        return entities;
    }
}