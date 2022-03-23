import { System } from "./system.js";

export class Component { }

/**
 * Use as a decorator to specify which components are handled by the system.
 * 
 * @example @RequiresComponents(Transform, Velocity)
 * @param components 
 */
export function RequiresComponents(...components: typeof Component[]) {
    return function (target: System, propertyKey: string, descriptor: PropertyDescriptor) {
        (target.constructor as typeof System).requiredComponents.push(components);
    };
}