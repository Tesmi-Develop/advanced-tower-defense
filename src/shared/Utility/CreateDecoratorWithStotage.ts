import { Constructor } from "@flamework/core/out/types"

export const CreateDecoratorWithStotage = <C extends object>() => {
    const store = new Map<string, Constructor<C>>();
    const decorator = <T extends Constructor<C>>(classConstructor: T) => {
        store.set(`${classConstructor}`, classConstructor);
    }

    return $tuple(decorator, store);
}
