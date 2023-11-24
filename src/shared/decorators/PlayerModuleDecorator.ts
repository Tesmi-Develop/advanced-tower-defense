import { Modding, Reflect } from "@flamework/core";
import { PlayerReplica } from "Types/Data/Replica";

/**
 * Generates metadata for implementors of this interface.
 * @server
 * @metadata flamework:implements OnReplicaCreated
 */
export interface OnReplicaCreate {
    OnReplicaCreate(replica: PlayerReplica): void;
}

/**
 * Generates metadata for implementors of this interface.
 * @server
 * @metadata flamework:implements OnReplicaCreated
 */
export interface OnDataCreate {
    OnDataCreate(profile: ProfileData, dynamic: DynamicData): void;
}

export const PlayerModuleDecorator = Modding.createDecorator<[{
    loadOrder?: number
}?]>('Class', (descriptor, config) => {
    Reflect.defineMetadata(descriptor.object, "playerModule:loadOrder", config[0]?.loadOrder);
});