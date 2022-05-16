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

            if (entity.debug.strokeRect) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = entity.debug.strokeColor.toString();
                ctx.strokeRect(pos.x, pos.y, size.x, size.y);
            }

        }

        const anySelected = detailedEntities.some(e => e.debug.showDetail);
        if (anySelected) {
            // Background
            ctx.fillStyle = "rgb(0, 0, 0, 0.2)";
            ctx.fillRect(0, 0, canvas.width / 1.5, canvas.height);

            ctx.fillStyle = "white";
            for (const entity of detailedEntities) {
                if (entity.debug.showDetail) {
                    let y = 5;
                    // name
                    ctx.font = "30px monospace";
                    ctx.fillStyle = entity.debug.fillColor.toString();
                    ctx.fillText(entity.meta.name, 15, y += 40);

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

                    // Components
                    for (const componentName in entity) {
                        const component = entity[componentName] as Component;
                        
                        // Ignore meta and debug as they are usually not relevant
                        if (componentName === "meta" || componentName === "debug") {
                            continue;
                        }
                        
                        ctx.font = "25px monospace";
                        ctx.fillStyle = "rgb(255, 255, 255)";
                        ctx.fillText(componentName, 15, y += 50);
                        
                        // Component values
                        ctx.font = "22px monospace";
                        ctx.fillStyle = "rgb(190, 190, 190)";
                        for (const key in component) {
                            let value = (component[key] as object).toString();
                            // If toString was not useful, stringify may manage to show something better
                            if (value === "[object Object]") {
                                value = JSON.stringify(component[key]);
                            }

                            ctx.fillText("  " + key.padEnd(25) + value, 15, y += 30);
                        }
                    }
                }
            }
        }
    }
};