import { Modding } from "@flamework/core";
import { Constructor } from "@flamework/core/out/types";

export const VisualEffects = new Map<string, Constructor>();

export const VisualEffectDecorator = Modding.createDecorator<[]>("Class", (Descriptor) => {
    VisualEffects.set(tostring(Descriptor.object), Descriptor.object);
});