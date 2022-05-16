import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";
import { BoxCollider } from "magnet-bros/components/box-collider.js";
import { RigidBody } from "magnet-bros/components/rigibody.js";
import { Velocity } from "magnet-bros/components/velocity.js";
import { Entity } from "magnet-bros/metadata.js";

export const ColliderSystem: System = {
    requiredComponents: [[Transform, BoxCollider], [Transform, RigidBody, Velocity]],
    update(colliders: Entity[], bodies: Entity[]) {
        for (const body of bodies) {
            body.rigidBody.grounded = false;
            for (const collider of colliders) {
                const pos = collider.transform.position;
                const size = collider.transform.size;
                const topBox = { x: pos.x, y: pos.y, w: size.x, h: size.y / 2 };
                const bottomBox = { x: pos.x, y: pos.y + size.y / 2, w: size.x, h: size.y / 2 };
                const leftBox = { x: pos.x, y: pos.y, w: size.x / 2, h: size.y };
                const rightBox = { x: pos.x + size.x / 2, y: pos.y, w: size.x / 2, h: size.y };

                // Ground
                if (body.transform.position.y + body.transform.size.y / 2 < pos.y && body.velocity.linear.y > 0 &&
                    (!body.rigidBody.fallThrough || collider.boxCollider.collisions.bottom) &&
                    collider.boxCollider.collisions.top && transformIntersectBox(body.transform, topBox)) {
                    body.rigidBody.grounded = true;
                    body.velocity.linear.y *= -collider.boxCollider.bounciness;
                    body.transform.position.y = pos.y - body.transform.size.y;
                }

                // Ceiling
                if (body.transform.position.y + body.transform.size.y > pos.y + size.y && body.velocity.linear.y < 0 &&
                    collider.boxCollider.collisions.bottom && transformIntersectBox(body.transform, bottomBox)) {
                    body.velocity.linear.y *= -collider.boxCollider.bounciness;
                    body.transform.position.y = pos.y + size.y;
                }

                // Left
                if (body.transform.position.x < pos.x && collider.boxCollider.collisions.left &&
                    body.velocity.linear.x > 0 && transformIntersectBox(body.transform, leftBox)) {
                    body.velocity.linear.x *= -collider.boxCollider.bounciness;
                    body.transform.position.x = pos.x - body.transform.size.x;
                }

                // Right
                if (body.transform.position.x + body.transform.size.x > pos.x + size.x && body.velocity.linear.x < 0 &&
                    collider.boxCollider.collisions.right && transformIntersectBox(body.transform, rightBox)) {
                    body.velocity.linear.x *= -collider.boxCollider.bounciness;
                    body.transform.position.x = pos.x + size.x;
                }

            }
        }
    }
};

function transformIntersectBox(transform: Transform, box: { x: number, y: number, w: number, h: number }) {
    return transform.intersectsBox(box.x, box.y, box.w, box.h);
}