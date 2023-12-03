import { Constructor } from "@flamework/core/out/types";
import { TowerAttackMode } from "shared/Classes/Tower/TowerAttackMode";
import { TowerModule } from "shared/Classes/Tower/TowerModule";

export const TowerModes = new Map<string, Constructor<TowerAttackMode>>();

export const TowerModeDecorator = (object: Constructor<TowerAttackMode>) => {
    TowerModes.set(tostring(object), object);
}