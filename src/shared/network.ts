import { Networking } from "@flamework/networking";
import { BaseConfig } from "./visualEffects/BaseEffect";

interface ServerEvents {
    OnRequestSharedClasses(): void;
}

interface ClientEvents {
    CastVFX(Name: string, Config: BaseConfig): void;
    CreateClassInstance(objectName: string, args: unknown[], remoteEvent: RemoteEvent, syncProperties: Map<string, unknown>): void;
}

interface ServerFunctions {
    
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
