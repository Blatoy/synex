export enum GraphType {
    bars,
    lines
}

export enum LabelType {
    maxValue,
    minValue,
    start,
    end,
    middle,
    highlighted,
    text
}

export type GraphLabel = {
    type: LabelType
    text?: string
    suffix?: string
    prefix?: string
    decimals?: number
}

export type GraphSettings = {
    labels: {
        title: string | GraphLabel
        xAxisZero?: string | GraphLabel
        yAxisZero?: string | GraphLabel
        topLeft?: string | GraphLabel
        topRight?: string | GraphLabel
        bottomRight?: string | GraphLabel
        bottomCenter?: string | GraphLabel
        bottomLeft?: string | GraphLabel
        [key: string]: string | GraphLabel | undefined
    }
    maxValue?: number
    minValue?: number
    plotGraphOnly?: boolean
    slidingAverage?: number
    type: GraphType
    position: { x: number, y: number }
    size: { w: number, h: number }
    crop?: DataCrop
    color?: string
    slidingAverageColor?: string
    data: number[] | StackBarData[]
    previousMax?: number
}

type LabelPosition = {
    anchor: { x: "center" | "left" | "right", y: "middle" | "top" | "bottom" },
    pad: { x: number, y: number }
}

type LabelPositions = {
    [key: string]: LabelPosition
}

const labelsXPadding = 4;
const labelsYPadding = 4;
const textSizePadding = 25;

const labelPositions: LabelPositions = {
    title: {
        anchor: { x: "center", y: "top" },
        pad: { x: labelsXPadding, y: labelsYPadding }
    },
    xAxisZero: {
        anchor: { x: "left", y: "bottom" },
        pad: { x: labelsXPadding, y: -labelsYPadding }
    },
    yAxisZero: {
        anchor: { x: "left", y: "bottom" },
        pad: { x: labelsXPadding, y: -labelsYPadding - 20 }
    },
    topLeft: {
        anchor: { x: "left", y: "top" },
        pad: { x: labelsXPadding, y: labelsYPadding }
    },
    topRight: {
        anchor: { x: "right", y: "top" },
        pad: { x: -labelsXPadding, y: labelsYPadding }
    },
    bottomRight: {
        anchor: { x: "right", y: "bottom" },
        pad: { x: -labelsXPadding, y: -labelsYPadding }
    },
    bottomCenter: {
        anchor: { x: "center", y: "bottom" },
        pad: { x: labelsXPadding, y: -labelsYPadding }
    },
    bottomLeft: {
        anchor: { x: "left", y: "bottom" },
        pad: { x: labelsXPadding, y: -labelsYPadding }
    }
};

export type DataCrop = {
    start: number
    end: number
}

export type StackBarData = {
    values: number[],
    colors: string[]
}

export class Graphics {
    static renderGraph(ctx: CanvasRenderingContext2D, settings: GraphSettings) {
        const x = settings.position.x;
        const y = settings.position.y;
        const w = settings.size.w;
        const h = settings.size.h;

        const start = settings.crop?.start || 0;
        const end = settings.crop?.end || settings.data.length;

        let { min, max } = this.minMaxInData(start, end, settings.data);

        if (settings.maxValue !== undefined) {
            max = settings.maxValue;
        }
        if (settings.minValue !== undefined) {
            min = settings.minValue;
        }

        // Compute all texts and their widths
        const texts: { [key: string]: string } = {};
        const textWidths: { [key: string]: TextMetrics } = {};

        for (const labelEmplacement in settings.labels) {
            let label = settings.labels[labelEmplacement];
            // The first time it's called, this will convert all text types to the correct type
            if (typeof label === "string") {
                label = {
                    text: label,
                    type: LabelType.text
                };
                settings.labels[labelEmplacement] = label;
            }

            let labelText;
            switch (label?.type) {
                case LabelType.start: labelText = start.toFixed(label.decimals); break;
                case LabelType.end: labelText = end.toFixed(label.decimals); break;
                case LabelType.middle: labelText = ((start + end) / 2).toFixed(label.decimals); break;
                case LabelType.maxValue: labelText = max.toFixed(label.decimals); break;
                case LabelType.minValue: labelText = min.toFixed(label.decimals); break;
                case LabelType.highlighted: labelText = "TODO: HIGHLIGHTED"; break;
                case LabelType.text: labelText = label?.text; break;
            }

            const text = `${label?.prefix || ""}${labelText}${label?.suffix || ""}`;
            textWidths[labelEmplacement] = ctx.measureText(text);
            texts[labelEmplacement] = text;
        }

        // Render background
        if (!settings.plotGraphOnly) {
            Graphics.renderBackground(ctx, x, y, w, h, settings, textWidths, texts);
        }

        const gx = x + (settings.labels.yAxisZero === undefined ? 0 : (textWidths.yAxisZero.width + labelsXPadding * 2));
        const gy = y + textSizePadding + labelsYPadding;
        const gw = w - (gx - x);
        const gh = h - 2 * (textSizePadding + labelsYPadding);
        const count = end - start;

        if (!settings.plotGraphOnly) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(gx, gy, gw, gh);
        }

        ctx.fillStyle = settings.color || "dodgerblue";
        ctx.strokeStyle = settings.color || "dodgerblue";

        const width = this.valueCountToWidth(start, end, gw);

        switch (settings.type) {
            case GraphType.bars: {
                for (let i = start; i < end; i++) {
                    const data = settings.data[i] || 0;
                    const x = gx + this.indexToX(i, start, count, gw);

                    if (typeof data === "number") {
                        const y = gy + this.valueToY(data, max, gh);
                        const height = this.valueToHeight(data, max, gh);
                        ctx.fillRect(x, y, width - 4, height);
                    } else {
                        let cumSum = 0;
                        for (let j = 0; j < data.values.length; j++) {
                            cumSum += data.values[j];
                            const y = gy + this.valueToY(cumSum, max, gh);
                            const height = this.valueToHeight(data.values[j], max, gh);
                            ctx.fillStyle = data.colors[j];
                            ctx.fillRect(x, y, width - 4, height - 2);
                        }
                    }
                }
            }
                break;
            case GraphType.lines: {
                ctx.beginPath();
                for (let i = start; i < end; i++) {
                    const data = settings.data[i] || 0;
                    const x = gx + this.indexToX(i, start, count, gw);

                    if (typeof data === "number") {
                        const y = gy + this.valueToY(data, max, gh);

                        if (i === start) {
                            ctx.moveTo(x, y);
                        }
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();

                if (settings.slidingAverage) {
                    ctx.strokeStyle = settings.slidingAverageColor || "orangered";
                    ctx.beginPath();
                    for (let i = start; i < end; i += settings.slidingAverage) {
                        let sum = 0;
                        for (let j = i; j < i + settings.slidingAverage && j < end; j++) {
                            const data = settings.data[j];
                            if (typeof data === "number") {
                                sum += data;
                            }
                        }
                        const x = gx + this.indexToX(i, start, count, gw);
                        const y = gy + this.valueToY(sum / settings.slidingAverage, max, gh);

                        if (i === start) {
                            ctx.moveTo(x, y);
                        }
                        ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            }
                break;
        }
    }

    private static renderBackground(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, settings: GraphSettings, textWidths: { [key: string]: TextMetrics }, texts: { [key: string]: string }) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(x, y, w, h);

        // Render legends
        ctx.fillStyle = "white";
        ctx.font = "20px monospace";

        // Write texts
        for (const labelEmplacement in settings.labels) {
            const labelPlacement = labelPositions[labelEmplacement];
            const labelPosition = this.getLabelPosition(labelPlacement, { x, y, w, h });

            ctx.textAlign = labelPlacement.anchor.x;
            ctx.textBaseline = labelPlacement.anchor.y;

            // Special case as we want to keep the x axis label at the end of the y axis label
            let offset = 0;
            if (labelEmplacement === "xAxisZero" && textWidths.yAxisZero) {
                offset = textWidths.yAxisZero.width + labelsXPadding;
                ctx.textAlign = "center";
            }

            ctx.fillText(texts[labelEmplacement], labelPosition.x + offset, labelPosition.y);
        }
    }

    private static indexToX(i: number, start: number, count: number, width: number) {
        return width * ((i - start) / count);
    }

    private static valueToY(value: number, maxValue: number, height: number) {
        return height * (1 - (value / maxValue));
    }

    private static valueToHeight(value: number, maxValue: number, height: number) {
        return height * (value / maxValue);
    }

    private static valueCountToWidth(start: number, end: number, width: number) {
        return width / (end - start);
    }

    private static minMaxInData(start: number, end: number, data: number[] | StackBarData[]) {
        let min = Infinity;
        let max = -Infinity;

        for (let i = start; i < Math.min(data.length, end); i++) {
            const barData = data[i];
            if (typeof barData === "number") {
                if (barData < min) {
                    min = barData;
                }
                if (barData > max) {
                    max = barData;
                }
            } else {
                const sum = barData.values.reduce((prev, val) => prev + val, 0);
                if (sum < min) {
                    min = sum;
                }
                if (sum > max) {
                    max = sum;
                }
            }
        }

        return { min, max };
    }

    private static getLabelPosition(posInfo: LabelPosition, { x = 0, y = 0, w = 0, h = 0 }) {
        const pos = { x: 0, y: 0 };
        switch (posInfo.anchor.x) {
            case "center":
                pos.x = x + w / 2;
                break;
            case "left":
                pos.x = x;
                break;
            case "right":
                pos.x = x + w;
                break;
        }

        switch (posInfo.anchor.y) {
            case "middle":
                pos.y = y + h / 2;
                break;
            case "top":
                pos.y = y;
                break;
            case "bottom":
                pos.y = y + h;
                break;
        }

        pos.x += posInfo.pad.x;
        pos.y += posInfo.pad.y;

        return pos;
    }

    /**
     * Based on https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
     */
    static colorFromText(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = "#";
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += value.toString(16).padStart(2, "0");
        }
        return color;
    }

    static cropEnd(totalElementCount: number, displayedCount: number, selectedIndex = -1) {
        if (selectedIndex === -1) {
            return { start: Math.max(totalElementCount - displayedCount, 0), end: totalElementCount };
        } else {
            const start = Math.max(0, selectedIndex - displayedCount / 2);
            const end = Math.min(totalElementCount, start + displayedCount);
            return { start: Math.max(0, end - displayedCount), end: Math.min(end, totalElementCount) };
        }
    }
}