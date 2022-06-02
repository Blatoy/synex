/**
 * Component definition
 * Components must contain fields with default values!
 * It's possible to store a class as long as it can be restored with Object.assign()
 * 
 * This cannot be an interface as the type is required at runtime
 */
export class Component {
    /** overridden at runtime, actual name can be chosen in the game's metadata.ts */
    static componentName = "";
    [key: string]: unknown;
}

/**
 * Component saved in a scene file. This is different than what is used at runtime to serialize entities
 * valuesOverride specifies which values are replaced in the component, otherwise the default component value is used
 * 
 * This is also the type that is used by entity.addComponent() and entity.spawn()
 */
export type SerializedComponent = {
    Type: typeof Component
    valuesOverride?: { [key: string]: unknown }
};