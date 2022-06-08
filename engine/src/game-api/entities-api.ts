import { State } from "frame-state.js";
import { SerializedComponent } from "game-lib/types/component.js";
import { GenericEntity } from "game-lib/types/entity.js";
import { Entities } from "game-lib/types/game-api/entities.js";
import { GameTemplate } from "game-template.js";
import { MetaEntity } from "meta-entity.js";

export class EntitiesAPI implements Entities {
    private entitiesToBeSpawned: GenericEntity[] = [];

    constructor(public state: State) {}

    spawn(name: string, ...components: SerializedComponent[]): void {
        // TODO: Should this emit a global action?
        // ^ No if it's something deterministic (e.g. timed spawner, hitbox or something)
        // ^ Yes if it's done by something local (local spawn menu)
        this.entitiesToBeSpawned.push(GameTemplate.entityFromDefinition(
            { metadata: { name }, components }
        ));
    }

    getByName(name: string) {
        for (const entity of this.state.entities) {
            if (entity.meta.name === name) {
                return entity;
            }
        }
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

    addQueuedComponents(entities: GenericEntity[]) {
        /* for (let i = 0; i < entities.length; i++) {
            const meta = entities[i].meta as MetaEntity;
            if (meta.scheduledForDeletion) {
                entities.splice(i, 1);
                i--;
            }
        } */
    }
}