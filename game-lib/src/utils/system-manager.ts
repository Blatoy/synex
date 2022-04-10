import { System } from "types/system.js";
import { GenericEntity } from "types/entity.js";
import { Component } from "types/component.js";

export class SystemManager {
    /**
     * Returns a function that can be used to load and live reload systems
     * TODO: Move this into something that is not accessible by the engine?
     * @param gameBasePathURL Base URL used to load the game
     * @returns 
     */
    public static createImporter(gameBasePathURL: string) {
        const basePath = new URL(gameBasePathURL).searchParams.get("basePath");
    
        if (basePath === null) {
            throw new Error("`basePath` query parameter must be specified when importing metadata");
        }
    
        return async (...systemFiles: string[]) => {
            const promises = systemFiles.map(file => import(`${basePath}/systems/${file}.js?r=${Math.random()}`));
            const systems = await Promise.all(promises);
            return systems.map((system) => Object.values(system)[0]) as System[];
        };
    }

    private static affectedEntitiesCache: {[key: string]: GenericEntity[][]} = {};

    /**
     * Build a list of group of entities for a given system that can be used as a parameter for updates functions
     * TODO: Should probably only be usable by the engine?
     * @param system 
     * @param entities 
     */
    public static getAffectedEntities(system: System, entities: GenericEntity[]) {
        // very very basic caching that needs to be invalidated manually
        /*if (SystemManager.affectedEntitiesCache[system.requiredComponents.toString()]) {
            return SystemManager.affectedEntitiesCache[system.requiredComponents.toString()];
        }*/
        const requiredComponentsArray: typeof Component[] = [];
        const matchingEntityGroups: GenericEntity[][] = [];

        for (const components of system.requiredComponents) {
            // required components can either be asked as a list of list (to generate groups in parameters)
            // or a simple list of parameter, this check should probably not be done at runtime (especially not the way)
            // it is currently done, since technically checking for the first element is enough
            if (Array.isArray(components)) {
                matchingEntityGroups.push(entities.filter(entity => 
                    entity.meta.hasComponents(components)
                ));
            } else {
                requiredComponentsArray.push(components);
            }
        }

        if (requiredComponentsArray.length > 0) {
            matchingEntityGroups.push(entities.filter(entity => entity.meta.hasComponents(requiredComponentsArray)));
        }

        const filteredEntityGroups = matchingEntityGroups.filter(groups => groups.length > 0);
        // SystemManager.affectedEntitiesCache[system.requiredComponents.toString()] = filteredEntityGroups;
        return filteredEntityGroups;
    }
}