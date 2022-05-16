import { Engine } from "engine.js";
import { Meta } from "game-lib/types/game-api/meta.js";
import { GameMetadata } from "game-lib/types/game-metadata.js";
import { MetaEntity } from "meta-entity.js";

export class MetaAPI implements Meta {
    constructor(private engine: Engine) { }

    systemsHandlingEntity(metaEntity: MetaEntity): string[] {
        const systemIndices = [];
        const systemCount: Map<number, number> = new Map();

        for (let i = 0; i < this.engine.systems.length; i++) {
            const system = this.engine.systems[i];
            const requiredComponents = system.requiredComponents;
            for (const requiredComponent of requiredComponents) {
                if (Array.isArray(requiredComponent)) {
                    if (metaEntity.hasComponents(requiredComponent)) {
                        if (!systemCount.has(i)) {
                            systemIndices.push(i);
                        }
                        systemCount.set(i, (systemCount.get(i) || 0) + 1);
                    }
                } else {
                    if (metaEntity.hasComponents([requiredComponent])) {
                        if (!systemCount.has(i)) {
                            systemIndices.push(i);
                        }
                        systemCount.set(i, (systemCount.get(i) || 0) + 1);
                        break;
                    }
                }
            }
        }

        return systemIndices.map(i =>
            this.engine.gameTemplate.gameMetadata.systemNames[i] +
            ((systemCount.get(i) || 0) > 1 ? " (x" + systemCount.get(i) + ")" : "")
        );
    }

    get gameDefinition(): GameMetadata {
        return this.engine.gameTemplate.gameMetadata;
    }

    get instanceName(): string {
        return this.engine.name;
    }

    get currentFrameIndex(): number {
        return this.engine.currentState.frameIndex;
    }

    log(...args: any[]): void {
        console.log(
            `[${this.engine.name}]`,
            (this.engine.debugger.inRollback ? `(${this.engine.debugger.currentRollbackFrame}/` : "(") +
            `${this.currentFrameIndex})`, ...args);
    }
}