export class Color {

    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    private hexValue = "";
    private rgbaValue = "";

    constructor(r = 0, g = 0, b = 0, a = 1) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;

        this.recomputeStrings();
    }

    recomputeStrings() {
        this.hexValue = `${this._r.toString(16).padStart(2, "0")}${this._g.toString(16).padStart(2, "0")}${this._b.toString(16).padStart(2, "0")}`;
        this.rgbaValue = `rgba(${this._r},${this._g},${this._b},${this._a})`;
    }

    set r(val: number) {
        this._r = val; 
        this.recomputeStrings();
    }
    set g(val: number) {
        this._g = val;
        this.recomputeStrings();
    }
    set b(val: number) {
        this._b = val; 
        this.recomputeStrings();
    }
    set a(val: number) {
        this._a = val;
        this.recomputeStrings();
    }

    toHex() {
        return this.hexValue;
    }

    toString() {
        return this.rgbaValue;
    }
}