import { Owner } from "game-lib/base-components/owner.js";
import { Transform } from "game-lib/base-components/transform.js";
import { System } from "game-lib/types/system.js";

export const CreditsSystem: System = {
    requiredComponents: [Owner],
    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        if (this.actions.getContext() === "menu") {
            ctx.save();
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.font = "50px arial";
            let y = canvas.height * 0.15;
            ctx.fillStyle = "white";
            ctx.fillText("== Credits ==", canvas.width / 2, y);
            ctx.font = "40px mono";

            ctx.fillText("- Art -", canvas.width / 2, y += 120);
            ctx.fillText("Loïck Jeanneret", canvas.width / 2, y += 50);
            ctx.fillText("Alexandre Bianchi", canvas.width / 2, y += 50);

            ctx.fillText("Music by Eric Matyas", canvas.width / 2, y += 120);
            ctx.fillText("www.soundimage.org", canvas.width / 2, y += 80);

            ctx.fillText("- Sound effects - ", canvas.width / 2, y += 100);
            ctx.fillText("Eric Matyas", canvas.width / 2, y += 80);
            ctx.fillText("www.soundimage.org", canvas.width / 2, y += 50);
            ctx.fillText("Loïck Jeanneret", canvas.width / 2, y += 50);
            ctx.restore();
        }
    }
};