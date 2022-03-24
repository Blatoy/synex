import { SerializedComponent } from "scene.js";
import { System } from "./system.js";

export class Component {
    static componentName = "";

    static deserialize(data: SerializedComponent) {
        const component = new data.Type;

        for (const key in data.valuesOverride) {
            if (key in component) {
                // TODO: Find a way to not cast as any here
                const componentValue = (component as any);
                const newValue = data.valuesOverride[key];
                const isObject = typeof componentValue[key] === "object";
                if (isObject) {
                    // TODO: Handle deeper copy?
                    Object.assign(componentValue[key], newValue);
                } else {
                    componentValue[key] = newValue;
                }
            } else {
                console.warn("Component", data.Type.componentName, "does not have value", key, "=", data.valuesOverride[key]);
            }
        }

        return component;
    }
}

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