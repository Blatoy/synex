import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Owner } from "game-lib/base-components/owner.js";
import { Debug } from "game-lib/base-components/debug.js";

import { Spawner, SpawnerType } from "magnet-bros/components/spawner.js";
import { Entity } from "magnet-bros/metadata.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Acceleration } from "magnet-bros/components/acceleration.js";
import { Vector2 } from "game-lib/utils/vector2.js";
import { RigidBody } from "magnet-bros/components/rigibody.js";
import { Movement } from "magnet-bros/components/movement.js";

import { RespawnTimer } from "magnet-bros/components/respawn-timer.js";
import { Magnetic } from "magnet-bros/components/magnetic.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { Animation } from "magnet-bros/components/animation.js";
import { Sprite } from "magnet-bros/components/sprite.js";

export const SpawnerSystem: System = {
    requiredComponents: [[Spawner, Transform], [Owner, RespawnTimer]],
    update(spawners: Entity[], respawningEntities: Entity[]) {
        // To handle late join, player must be spawned when someone joins
        const joinActions = this.actions.byType("network", "sceneLoaded");

        for (const spawner of spawners) {
            switch (spawner.spawner.type) {
                case SpawnerType.PLAYER: {
                    const spawnData = [];

                    for (const join of joinActions) {
                        spawnData.push(join.ownerId);
                    }

                    for (const entity of respawningEntities) {
                        if (entity.respawnTimer.timeLeft <= 0) {
                            // Deletion is handled by Respawn component
                            // TODO: Event system should probably be used here for a way more elegant solution
                            spawnData.push(entity.owner.id);
                        }
                    }

                    for (const ownerId of spawnData) {
                        this.entities.spawn("Player " + ownerId,
                            { Type: RigidBody },
                            { Type: Magnetic },
                            { Type: RadialMagneticField },
                            {
                                Type: Sprite,
                                valuesOverride: {
                                    sheetURL: "./magnet-bros/player.png",
                                    name: "magnet-player",
                                    width: 16,
                                    height: 32
                                }
                            },
                            { Type: Animation },
                            {
                                Type: RespawnTimer,
                                valuesOverride: {
                                    timeLeft: 60
                                } as RespawnTimer
                            },
                            {
                                Type: Movement,
                                valuesOverride: {
                                    acceleration: 8,
                                    jumpForce: -10.5,
                                    maxJumpTick: 7
                                } as Movement
                            },
                            {
                                Type: Owner,
                                valuesOverride: {
                                    id: ownerId
                                }
                            },
                            {
                                Type: Transform,
                                valuesOverride: {
                                    position: spawner.transform.position,
                                    size: spawner.transform.size
                                } as Transform
                            },
                            {
                                Type: Velocity,
                                valuesOverride: {
                                    maxLinear: new Vector2(15, 30),
                                    minLinear: new Vector2(-15, -50)
                                } as Velocity
                            },
                            {
                                Type: Acceleration,
                                valuesOverride: {
                                    linear: new Vector2(0, 2),
                                    linearFriction: new Vector2(0.7, 0.99)
                                } as Acceleration
                            },
                            {
                                Type: Debug,
                                valuesOverride: {
                                    fillColor: {
                                        b: 255,
                                        r: 255,
                                        g: 255
                                    },
                                    fillRect: false,
                                    showName: true
                                }
                            }
                        );
                    }
                } break;

                default:
                    break;
            }
        }

    }
};