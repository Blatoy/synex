import { GenericEntity, SerializedEntity } from "game-lib/types/entity.js";
import { GameTemplate } from "game-template.js";
import { MetaEntity } from "meta-entity.js";

export type SerializedState = {
    frameIndex: number,
    entities: SerializedEntity[]
}

export class State {
    constructor(public entities: GenericEntity[] = [], public frameIndex: number = 0) { }

    serialize() {
        return JSON.stringify({entities: this.entities, frameIndex: this.frameIndex});
    }

    // TODO: While not half asleep, use a reviver maybe?
    static deserialize(state: string, gameTemplate: GameTemplate) {
        const entities: GenericEntity[] = [];
        const deserialized: SerializedState = JSON.parse(state);
        const savedEntities: SerializedEntity[] = deserialized.entities; // TODO: Correct typing
        
        savedEntities.forEach((savedEntity) => {
            // Create entity
            const entity: GenericEntity = {
                meta: new MetaEntity(
                    savedEntity.meta.name,
                    savedEntity.meta.components.map(name => gameTemplate.gameMetadata.components[name])
                )
            };

            // For each components of the entity, set back their value
            for (const componentClass of entity.meta.components) {
                const component = new componentClass();
                entity[componentClass.componentName] = component;
                for (const key in savedEntity[componentClass.componentName]) {
                    if (typeof component[key] === "object") {
                        Object.assign(component[key], savedEntity[componentClass.componentName][key]);
                    } else {
                        component[key] = savedEntity[componentClass.componentName][key];
                    }
                }
            }

            entities.push(entity);
        });

        return new State(entities, deserialized.frameIndex);
    }
}