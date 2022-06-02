import { SerializedComponent } from "types/component.js";

export class ComponentManager {
    /**
     * @returns Deserialized component. Should not be used by games (?)
     */
    public static deserialize(data: SerializedComponent) {
        const component = new data.Type();

        for (const key in data.valuesOverride) {
            if (key in component) {
                const componentValue = (component as { [key: string]: unknown });
                const newValue = data.valuesOverride[key];
                const isObject = typeof componentValue[key] === "object";
                if (isObject) {
                    // TODO: Handle deeper copy?
                    Object.assign(componentValue[key], newValue);
                } else {
                    componentValue[key] = newValue;
                }
            } else {
                console.warn("Component", data.Type.constructor.name, "does not have value", key, "=", data.valuesOverride[key]);
            }
        }

        return component;
    }
}