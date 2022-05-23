import { SerializedComponent } from "game-lib/types/component.js";
import { GenericEntity } from "game-lib/types/entity.js";
import { Entities } from "game-lib/types/game-api/entities.js";
import { ComponentManager } from "game-lib/utils/component-manager.js";
import { MetaEntity } from "meta-entity.js";

export class EntitiesAPI implements Entities {
    private entitiesToBeSpawned: GenericEntity[] = [];
    spawn(name: string, ...components: SerializedComponent[]): void {
        // TODO: Should this emit a global action?
        // ^ No if it's something deterministic (e.g. timed spawner, hitbox or something)
        // ^ Yes if it's done by something local (local spawn menu)

        // TODO: Do not duplicate the code from game-template, add a function somewhere
        const entity: GenericEntity = {
            meta: new MetaEntity(
                name,
                components.map(serializedComponent => serializedComponent.Type)
            )
        };

        components.forEach((component) => {
            entity[component.Type.componentName] = ComponentManager.deserialize(component);
        });

        this.entitiesToBeSpawned.push(entity);
    }

    spawnQueuedEntities(entities: GenericEntity[]) {
        for (let i = 0; i < this.entitiesToBeSpawned.length; i++) {
            entities.push(this.entitiesToBeSpawned[i]);
        }
        this.entitiesToBeSpawned = [];
    }

    deleteMarkedEntities(entities: GenericEntity[]) {
        for (let i = 0; i < entities.length; i++) {
            const meta = entities[i].meta as MetaEntity;
            if (meta.scheduledForDeletion) {
                entities.splice(i, 1);
                i--;
            }
        }
    }
}