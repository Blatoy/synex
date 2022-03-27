import { Component } from "component.js";
import { Scene } from "scene.js";
import { System } from "system.js";

export interface GameDefinition {
    systems: typeof System[];
    components: { [key: string]: typeof Component };
    scenes: Scene[]
    version: string;
}

export function importGameSystems(basePathURL: string) {
    const basePath = new URL(basePathURL).searchParams.get("basePath");

    if (basePath === null) {
        throw new Error("`basePath` query parameter must be specified when importing metadata");
    }

    return async (...systemFiles: string[]) => {
        const promises = systemFiles.map(file => import(`${basePath}/systems/${file}.js?r=${Math.random()}`));
        const systems = await Promise.all(promises);
        return systems.map((system) => Object.values(system)[0]) as typeof System[];
    };
}