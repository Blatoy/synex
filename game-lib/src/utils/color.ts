export class Color {

    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    private hexValue = "";
    private rgbaValue = "";

    /**
     * Create a color
     * @param r red (0..255)
     * @param g green (0..255)
     * @param b blue (0..255)
     * @param a alpha (0..1)
     */
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;

        this.recomputeStrings();
    }

    private recomputeStrings() {
        this.hexValue = `${this._r.toString(16).padStart(2, "0")}${this._g.toString(16).padStart(2, "0")}${this._b.toString(16).padStart(2, "0")}`;
        this.rgbaValue = `rgba(${this._r},${this._g},${this._b},${this._a})`;
    }

    /**
     * Update red
     */
    set r(val: number) {
        this._r = val;
        this.recomputeStrings();
    }

    /**
     * Update green
     */
    set g(val: number) {
        this._g = val;
        this.recomputeStrings();
    }

    /**
     * Update blue
     */
    set b(val: number) {
        this._b = val;
        this.recomputeStrings();
    }

    /**
     * Update alpha
     */
    set a(val: number) {
        this._a = val;
        this.recomputeStrings();
    }

    /**
     * @returns hex color string without #
     */
    toHex() {
        return this.hexValue;
    }

    /**
     * @returns rgba(r,g,b,a)
     */
    toString() {
        return this.rgbaValue;
    }
}