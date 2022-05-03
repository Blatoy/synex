import { System } from "game-lib/types/system.js";
import { Owner } from "demo-game/components/owner.js";
import { Spawner } from "demo-game/components/spawner.js";
import { Transform } from "demo-game/components/transform.js";
import { Entity } from "demo-game/metadata.js";
import { Animation } from "demo-game/components/animation.js";

import { Velocity } from "../components/velocity.js";
import { Magnetic } from "demo-game/components/magnetic.js";
import { MagneticField } from "demo-game/components/magnetic-field.js";
import { Debug } from "demo-game/components/debug.js";
import { Parent } from "demo-game/components/parent.js";
import { Parented } from "demo-game/components/parented.js";
import { Health } from "demo-game/components/health.js";

export const PlayerSpawner: System = {
    requiredComponents: [Spawner, Transform],
    updateAll(spawner: Entity) {
        const joinActions = this.actions.byType("network", "sceneLoaded");
        const respawnActions = this.actions.byType("default", "respawn");


        for (const action of joinActions.concat(respawnActions)) {
            this.entities.spawn(
                { Type: Health },
                { Type: Parent, valuesOverride: { id: "player" + action.ownerId } },
                { Type: Velocity }, { Type: Animation }, { Type: Magnetic },
                { Type: Owner, valuesOverride: { id: action.ownerId } },
                {
                    Type: Transform,
                    valuesOverride: {
                        position: {
                            x: spawner.transform.position.x,
                            y: spawner.transform.position.y
                        },
                        size: {
                            x: spawner.transform.size.x,
                            y: spawner.transform.size.y
                        }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 0,
                            r: 255,
                            g: 255
                        },
                        strokeColor: {
                            b: 0,
                            r: 255,
                            g: 255
                        },
                        fillRect: false,
                        strokeRect: false,
                        showName: true
                    }
                }
            );
        }
        for (const action of joinActions) {
            this.entities.spawn(
                { Type: Parented, valuesOverride: { parentId: "player" + action.ownerId, offsetY: -250 } },
                { Type: Owner, valuesOverride: { id: action.ownerId } },
                {
                    Type: MagneticField,
                    valuesOverride: {
                        force: { x: 0, y: 1},
                        lockYMovement: true
                    }
                },
                {
                    Type: Transform,
                    valuesOverride: {
                        size: { x: spawner.transform.size.x, y: 250 }
                    }
                },
                {
                    Type: Debug,
                    valuesOverride: {
                        fillColor: {
                            b: 0,
                            r: 255,
                            g: 0,
                            a: 0.4
                        },
                        strokeColor: {
                            b: 0,
                            r: 200,
                            g: 0
                        },
                        fillRect: true,
                        strokeRect: false,
                        showName: false
                    }
                }
            );
        }
    }
};