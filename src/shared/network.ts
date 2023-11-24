import { Networking } from "@flamework/networking";
import { BaseConfig } from "./visualEffects/BaseEffect";


interface ServerEvents {
}

interface ClientEvents {
    CastVFX(Name: string, Config: BaseConfig): void;
}

interface ServerFunctions {
    
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
