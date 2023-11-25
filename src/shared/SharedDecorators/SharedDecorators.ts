import { Constructor } from "@flamework/core/out/types";
import Maid from "@rbxts/maid";
import Signal from "@rbxts/rbx-better-signal";
import { ReplicatedStorage, RunService } from "@rbxts/services";
import { GlobalEvents } from "shared/network";

enum PackageType {
    callMethod
}

interface SharedClass {
    Constructor: Constructor;
    OnCreate: Signal<(instance: object) => void>;
    OnPlayerReplicated: Signal<(instance: object, player: Player) => void>;
    SyncProperties: string[];
}

interface IPackageCallMethod {
    methodName: string;
    args: unknown[];
}

const SharedClasses = new Map<string, SharedClass>();
const RemoteEvents = new Map<object, RemoteEvent>();
let SharedClassesFolder: Folder;

if (RunService.IsClient()) {
    GlobalEvents.client.CreateClassInstance.connect((objectName, args, remoteEvent, properties) => {
        if (!SharedClasses.has(objectName)) {
            warn(`Class ${objectName} does not exist but server sent it`);
            return;
        }
    
        const object = SharedClasses.get(objectName)!;
        const instance = new object.Constructor(remoteEvent as never, ...(args as never[]));

        properties.forEach((data, propertyName) => {
            instance[propertyName as never] = data as never;
        });

        (instance['InitClient' as never] as Callback)(instance);
    });
}

if (RunService.IsServer()) {
    SharedClassesFolder = new Instance('Folder', ReplicatedStorage);
    SharedClassesFolder.Name = 'SharedClasses';
}

const createRemoteEvent = (className: string) => {
    assert(RunService.IsServer(), 'createRemoteEvent can only be called on the server');

    const event = new Instance('RemoteEvent', SharedClassesFolder);
    event.Name = className;

    return event;
}

const SendPackage = <D extends object>(object: object, methodType: PackageType, data: D) => {
    assert(RunService.IsServer(), 'SendPackage can only be called on the server');

    const remoteEvent = RemoteEvents.get(object);
    assert(remoteEvent, 'This class is not shared. Please use @SharedClass');

    remoteEvent.FireAllClients(methodType, data);
}

const getSharedClass = (object: object) => {
    if (!SharedClasses.has(`${object}`)) {
        SharedClasses.set(`${object}`, {
            Constructor: object as Constructor,
            OnCreate: new Signal(),
            OnPlayerReplicated: new Signal(),
            SyncProperties: []
        });
    }

    return SharedClasses.get(`${object}`)!;
}

const waitForSharedClass = (object: object) => {
    while (!SharedClasses.has(`${object}`)) {
        task.wait();
    }

    return SharedClasses.get(`${object}`)!;
}

// Not implemented

export const SharedMethod = () => {
    return (object: object, propertyName: string, description: TypedPropertyDescriptor<Callback>) => {
        if (RunService.IsServer()) {
            const originalMethod = description.value;
            
            description.value = function(this, ...args: unknown[]) {
                SendPackage(this, PackageType.callMethod, {
                    methodName: propertyName,
                    args: args,
                });

                originalMethod(this, ...args);
            }
        }

        return description;
    }
}

export const SyncProperty = () => {
    return (object: object, propertyName: string) => {
        const sharedClass = getSharedClass(object);
        sharedClass.SyncProperties.push(propertyName);
    }
}

export const ClientMethod = () => {
    return (object: object, propertyName: string, description: TypedPropertyDescriptor<Callback>) => {
        const originalMethod = description.value;

        description.value = function(this, ...args: unknown[]) {
            if (RunService.IsServer()) {
               SendPackage(this, PackageType.callMethod, {
                    methodName: propertyName,
                    args: args,
               });
               return;
            }
            originalMethod(this, ...args);
        }

        return description;
    }
}

const initClientPackageParser = (object: object, remoteEvent: RemoteEvent) => {
    remoteEvent.OnClientEvent.Connect((method: PackageType, data: object) => {
        if (method === PackageType.callMethod) {
            const castedData = data as IPackageCallMethod;
            const callback = object[castedData.methodName as never] as Callback;
            callback(object, ...castedData.args);
        }
    });
}

const generateReplicatedProperties = (object: object) => {
    const sharedClass = getSharedClass(getmetatable(object) as object);
    const data = new Map<string, unknown>();

    sharedClass.SyncProperties.forEach((value) => {
       data.set(value, object[value as never]); 
    });

    return data
}

export const SharedClass = () => {
    return (object: object) => {
        const objectWithconstructor = object as { constructor: (...args: defined[]) => unknown };
        const originalConstructor = objectWithconstructor.constructor;
    
        const sharedClassWrapper = getSharedClass(object);
    
        let freeId = 0;
        let connection: RBXScriptConnection;
        const maid = new Maid();
        let remoteEvent: RemoteEvent;
        const players = new Set<Player>();

        objectWithconstructor.constructor = function(this, ...args: defined[]) {
            // Server code
            if (RunService.IsServer()) {
                originalConstructor(this, ...args);
                
                remoteEvent = createRemoteEvent(`${object}${freeId}`);
                RemoteEvents.set(this, remoteEvent);
                freeId++;
                GlobalEvents.server.CreateClassInstance.broadcast(`${object}`, args, remoteEvent, generateReplicatedProperties(this));

                maid.GiveTask(GlobalEvents.server.OnRequestSharedClasses.connect((player) => {
                    GlobalEvents.server.CreateClassInstance.fire(player, `${object}`, args, remoteEvent, generateReplicatedProperties(this));
                }));

                maid.GiveTask(remoteEvent.OnServerEvent.Connect((player) => {
                    if (players.has(player)) return;
                    players.add(player);
                }));
                
                return;
            }

            // Client code
            remoteEvent = args[0] as RemoteEvent;
            assert(typeIs(remoteEvent, 'Instance') && remoteEvent.IsA('RemoteEvent'), 'Invalid RemoteEvent');

            RemoteEvents.set(this, remoteEvent);
            initClientPackageParser(this, remoteEvent);
           
            args.remove(0);

            originalConstructor(this, ...args);
            remoteEvent.FireServer();
        }
    }
}