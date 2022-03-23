import { GameEntity } from "game-lib/game-entity.js";
import { GameMetadata } from "game-lib/metadata.js";
import { Debug } from "./components/debug.js";
import { Transform } from "./components/transform.js";
import { Velocity } from "./components/velocity.js";
import { RenderDebugSystem } from "./systems/render-debug.js";
import { VelocitySystem } from "./systems/velocity.js";

// while I would love for this to be defined directly in the export
// i did not manage (yet) to extract the type defined here
// and not the one defined in the GameMetadata interface (try to move it down and observe how sad it is)
const components = {
    transform: Transform,
    velocity: Velocity,
    debug: Debug
};

const metadata: GameMetadata = {
    systems: [
        RenderDebugSystem,
        VelocitySystem
    ],
    components: components
};

export default metadata;
export type Entity = { meta: GameEntity } & { [K in keyof typeof components]: InstanceType<typeof components[K]> };