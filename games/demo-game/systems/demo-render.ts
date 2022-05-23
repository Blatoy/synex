import { System } from "game-lib/types/system.js";
import { DemoSelected } from "demo-game/components/demo-selected.js";
import { Entity } from "demo-game/metadata.js";

export const DemoRender: System = {
    requiredComponents: [DemoSelected],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, entities: Entity[]) {
        const anySelected = entities.some(e => e.demoSelected.selected);
        if (anySelected) {
            ctx.fillStyle = "rgb(0, 0, 0, 0.2)";
            ctx.fillRect(0, 0, canvas.width / 1.5, canvas.height);
            ctx.fillStyle = "white";

            for (const entity of entities) {
                if (entity.demoSelected.selected) {
                    ctx.font = "30px monospace";
                    let y = 5;
                    ctx.fillText("= " + entity.meta.name + " =", 15, y += 30);
                    ctx.font = "25px monospace";
                    for (const component in entity) {
                        if (component === "meta" || component === "demoSelected") {
                            continue;
                        }

                        ctx.fillText(component, 15, y += 50);
                        ctx.font = "22px monospace";
                        for (const key in (entity[component] as any)) {
                            let value = (entity[component] as any)[key].toString();
                            if (value === "[object Object]") {
                                value = JSON.stringify((entity[component] as any)[key]);
                            }
                            ctx.fillText("  " + key.padEnd(25) + value, 15, y += 30);
                        }
                    }
                    ctx.font = "30px monospace";
                }
            }
        }
    }
};