import { Component } from "../types/component.js";
import { Vector2 } from "../utils/vector2.js";

export class Transform extends Component {
    position = new Vector2();
    size = new Vector2(100, 100);
    rotation = 0;

    // Helpers functions in components should be really generic and should have
    // a user for multiple systems, as components must not have any behaviour
    // on their own
    // Maybe this should be in a list of general helper functions
    intersects(other: Transform): boolean {
        return this.intersectsBox(other.position.x, other.position.y, other.size.x, other.size.y);
    }

    intersectsBox(x: number, y: number, w: number, h: number): boolean {
        const pos = this.position;
        const size = this.size;

        return (pos.x + size.x > x && pos.x < x + w) && (pos.y + size.y > y && pos.y < y + h);
    }

    containsPoint(x: number, y: number) {
        const pos = this.position;
        const size = this.size;

        return x > pos.x && x < pos.x + size.x && y > pos.y && y < pos.y + size.y;
    }

    containsPointInWorld(x: number, y: number, translate: Vector2, scale: number) {
        const pos = this.position;
        const size = this.size;

        x = (x - translate.x) / scale;
        y = (y - translate.y) / scale;

        return x > pos.x && x < pos.x + size.x && y > pos.y && y < pos.y + size.y;
    }

    intersectsCircle(center: Vector2, radius: number) {
        // only check if the center is in the center
        return this.position.distanceTo(center) < radius;
    }
}