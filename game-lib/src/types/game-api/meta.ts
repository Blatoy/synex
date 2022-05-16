import { MetaEntity } from "types/entity.js";
import { GameMetadata } from "types/game-metadata.js";

export type Meta = {
    systemsHandlingEntity(requiredComponents: MetaEntity): string[],
    gameDefinition: GameMetadata
    instanceName: string
    currentFrameIndex: number
    log(...args: unknown[]): void
}