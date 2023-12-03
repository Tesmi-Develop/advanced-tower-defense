import { Constructor } from "@flamework/core/out/types";
import { TowerModule } from "shared/Classes/Tower/TowerModule";

export const TowerModules = new Map<string, Constructor<TowerModule>>();

export const TowerModuleDecorator = (object: Constructor<TowerModule>) => {
    TowerModules.set(tostring(object), object);
}