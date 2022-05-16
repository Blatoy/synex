export class Vector2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    magnitude() {
        return this.x * this.x + this.y * this.y;
    }

    distanceTo(other: Vector2) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }

    squareDistanceTo(other: Vector2) {
        return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
    }

    manhattanDistanceTo(other: Vector2) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    directionTo(other: Vector2) {
        return new Vector2(
            other.x - this.x,
            other.y - this.y
        );
    }

    // TODO: Vector should be immutable
    directionFrom(other: Vector2) {
        return new Vector2(
            this.x - other.x,
            this.y - other.y
        );
    }

    makeUnit() {
        const magnitude = this.magnitude();
        this.x /= magnitude;
        this.y /= magnitude;
    }

    add(other: Vector2) {
        this.x += other.x;
        this.y += other.y;
    }

    capMax(maxValues: Vector2) {
        this.x = Math.min(this.x, maxValues.x);
        this.y = Math.min(this.y, maxValues.y);
    }

    capMin(minValues: Vector2) {
        this.x = Math.max(this.x, minValues.x);
        this.y = Math.max(this.y, minValues.y);
    }

    scale(n: number) {
        this.x *= n;
        this.y *= n;
    }

    mulElementWise(other: Vector2) {
        this.x *= other.x;
        this.y *= other.y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}