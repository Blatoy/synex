import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { Owner } from "game-lib/base-components/owner.js";
import { Debug } from "game-lib/base-components/debug.js";

import { Entity } from "magnet-bros/metadata.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Acceleration } from "magnet-bros/components/acceleration.js";
import { Vector2 } from "game-lib/utils/vector2.js";
import { RigidBody } from "magnet-bros/components/rigibody.js";
import { Magnetic } from "magnet-bros/components/magnetic.js";

import { Animation } from "magnet-bros/components/animation.js";
import { Sprite } from "magnet-bros/components/sprite.js";
import { Lifetime } from "magnet-bros/components/lifetime.js";
import { Explode } from "magnet-bros/components/explode.js";
import { Explosion } from "magnet-bros/components/explosion.js";
import { RadialMagneticField } from "magnet-bros/components/radial-magnetic-field.js";
import { Color } from "game-lib/utils/color.js";
import { BASE_IMAGE_PATH } from "magnet-bros/paths.js";

export const SpawnerSystem: System = {
    requiredComponents: [[Owner, Transform], [Lifetime, Explode]],
    update(bombSpawners: Entity[], bombs: Entity[]) {
        for (const bomb of bombs) {
            if (bomb.lifetime.timeLeft === 1) {
                this.entities.spawn("Explosion of " + bomb.meta.name,
                    {
                        Type: Transform,
                        valuesOverride: {
                            position: bomb.transform.position,
                            size: bomb.transform.size
                        } as Transform
                    },
                    {
                        Type: Debug
                    },
                    {
                        Type: Lifetime,
                        valuesOverride: {
                            timeLeft: 60 * 2
                        } as Lifetime
                    },
                    {
                        Type: RadialMagneticField,
                        valuesOverride: {
                            force: 25000,
                            radius: 5,
                            backColor: new Color(240, 20, 20, 0.2)
                        } as RadialMagneticField
                    },
                    {
                        Type: Explosion,
                        valuesOverride: {
                            maxRadius: bomb.explode.radius
                        } as Explosion
                    }
                );
            }
        }

        for (const bombSpawner of bombSpawners) {
            // To handle late join, player must be spawned when someone joins
            const playerActions = this.actions.ofPlayer(bombSpawner.owner.id);

            if (playerActions["default:spawn_item"]) {
                this.entities.spawn("Bomb of " + bombSpawner.owner.id,
                    { Type: RigidBody },
                    { Type: Explode },
                    {
                        Type: Lifetime,
                        valuesOverride: {
                            enabled: true,
                            timeLeft: 30 * 4
                        } as Lifetime
                    },
                    { Type: Magnetic },
                    // { Type: RadialMagneticField, },
                    {
                        Type: Sprite,
                        valuesOverride: {
                            sheetURL: `${BASE_IMAGE_PATH}/bomb.png`,
                            name: "bomb",
                            width: 16,
                            height: 24
                        }
                    },
                    {
                        Type: Animation,
                        valuesOverride: {
                            animationsName: ["explode"],
                            animationDelays: [30],
                            animationsFrameCount: [4]
                        } as Animation
                    },
                    {
                        Type: Transform,
                        valuesOverride: {
                            position: new Vector2(
                                bombSpawner.transform.position.x,
                                bombSpawner.transform.position.y - 50),
                            size: new Vector2(16 * 4, 24 * 4)
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
                            linearFriction: new Vector2(0.95, 0.99)
                        } as Acceleration
                    },
                    {
                        Type: Debug,
                        valuesOverride: {
                            fillColor: {
                                b: 0,
                                r: 255,
                                g: 255
                            },
                            fillRect: false,
                            showName: false
                        }
                    }
                );
            }
        }
    }
};