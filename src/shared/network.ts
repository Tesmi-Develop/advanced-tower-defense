import { Networking } from "@flamework/networking";
import { BaseConfig } from "./visualEffects/BaseEffect";

interface ServerEvents {
    OnRequestSharedClasses(): void;
}

interface ClientEvents {
    CastVFX(Name: string, Config: BaseConfig): void;
    CreateClassInstance(objectName: string, args: unknown[], remoteEvent: RemoteEvent, syncProperties: Map<string, unknown>, clientMethodInitName?: string | number | symbol): void;
}

interface ServerFunctions {
    Vote(confirm: boolean): boolean;
    PlaceTower(towerName: string, ray: Ray): boolean;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
