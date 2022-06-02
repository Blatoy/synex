import { MetaEntity } from "types/entity.js";
import { GameMetadata } from "types/game-metadata.js";

/**
 * Meta information useful for debugging
 */
export type Meta = {
    /**
     * Return a list of system names for the given components
     * To use this, you MUST define systemNames in the game's metadata.ts!
     */
    systemsHandlingEntity(requiredComponents: MetaEntity): string[]
    /**
     * Raw access to the game meta data
     */
    gameDefinition: GameMetadata
    /**
     * Return the name of this engine.
     * WARNING: This can desync if used to update synchronized data!
     */
    instanceName: string
    /**
     * Return the <i>latest</i> frame index
     * WARNING: This *will* desync if used to update synchronized data!
     */
    currentFrameIndex: number
    /**
     * Return true if the update is called because of a rollback
     * WARNING: This *will* desync if used to update synchronized data!
     */
    inRollback: boolean
    /**
     * Return an increasing tick (same rate as game update speed)
     * WARNING: This *will* desync if used to update synchronized data!
     */
    tick: number
    /**
     * Return true if the game is focused and inputs are parsed
     * WARNING: This *will* desync if used to update synchronized data!
     */
    gameFocused: boolean
    /**
     * Return the local ID of the player
     * WARNING: This *will* desync if used to update synchronized data!
     */
    localId: string
    /**
     * Log to the console with additional infos
     */
    log(...args: unknown[]): void
}