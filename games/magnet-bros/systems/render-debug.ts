import { Debug } from "game-lib/base-components/debug.js";
import { Transform } from "game-lib/base-components/transform.js";
import { Component } from "game-lib/types/component.js";
import { System } from "game-lib/types/system.js";
import { Entity } from "magnet-bros/metadata.js";

export const DemoRender: System = {
    requiredComponents: [[Debug, Transform], [Debug]],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, debugRectangles: Entity[], detailedEntities: Entity[]) {
        for (const entity of debugRectangles) {
            const pos = entity.transform.position;
            const size = entity.transform.size;
            if (entity.debug.fillRect) {
                ctx.fillStyle = entity.debug.fillColor.toString();
                ctx.fillRect(pos.x, pos.y, size.x, size.y);
            }

            if (entity.debug.showName) {
                ctx.textAlign = "center";
                ctx.fillStyle = entity.debug.fillColor.toString();
                ctx.fillText(entity.meta.name, pos.x + size.x / 2, pos.y - 10);
            }

            if (entity.debug.strokeRect) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = entity.debug.strokeColor.toString();
                ctx.strokeRect(pos.x, pos.y, size.x, size.y);
            }

        }

        ctx.save();
        ctx.resetTransform();
        const anySelected = detailedEntities.some(e => e.debug.showDetail);
        if (anySelected) {
            // Background
            ctx.textAlign = "left";
            ctx.fillStyle = "rgb(0, 0, 0, 0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            for (let i = 0; i < detailedEntities.length; i++) {
                const entity = detailedEntities[i];
                if (entity.debug.showDetail) {
                    let y = 30 - entity.debug.detailScroll * 5;
                    // name
                    ctx.font = "30px monospace";
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 2;
                    ctx.strokeText(`#${i} ${entity.meta.name}`, 15, y += 40);
                    ctx.fillStyle = entity.debug.fillColor.toString();
                    ctx.fillText(`#${i} ${entity.meta.name}`, 15, y);

                    ctx.font = "25px monospace";
                    ctx.fillStyle = "white";

                    y += 10;

                    // System handling this entity
                    let systems = this.meta.systemsHandlingEntity(entity.meta);
                    systems = systems.filter((name) => !name.includes("update-debug") && !name.includes("render-debug"));
                    for (let i = 0; i < systems.length; i += 4) {
                        if (i === 0) {
                            ctx.fillText("Handled by: ", 15, y += 30);
                            y += 5;
                        }

                        ctx.fillStyle = "rgb(210, 210, 210)";
                        ctx.fillText("  " + systems.slice(i, i + 4).join(", "), 15, y += 30);
                    }

                    y += 50;
                    ctx.fillStyle = "white";
                    ctx.fillText("Components: ", 15, y + 10);

                    // Components
                    for (const componentName in entity) {
                        const component = entity[componentName] as Component;

                        // Ignore meta and debug as they are usually not relevant
                        if (componentName === "meta" || componentName === "debug") {
                            continue;
                        }

                        ctx.font = "25px monospace";
                        ctx.fillStyle = "rgb(250, 250, 250)";

                        ctx.fillText("  " + componentName, 15, y += 50);

                        // Component values
                        ctx.font = "22px monospace";
                        ctx.fillStyle = "rgb(190, 190, 190)";
                        for (const key in component) {
                            let value = (component[key] as object).toString();
                            // If toString was not useful, stringify may manage to show something better
                            if (value === "[object Object]") {
                                value = JSON.stringify(component[key]);
                            }

                            ctx.fillText("   " + key.padEnd(25) + value, 15, y += 35);
                        }
                    }
                }
            }
        }

        ctx.restore();
    }
};