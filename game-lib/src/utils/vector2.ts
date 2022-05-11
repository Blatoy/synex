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

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}