export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toHex() {
        return `${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`;
    }

    toString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}