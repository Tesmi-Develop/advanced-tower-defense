import { Constructor } from "@flamework/core/out/types";
import Maid from "@rbxts/maid";
import Object from "@rbxts/object-utils";
import Signal from "@rbxts/rbx-better-signal";
import { ReplicatedStorage, RunService } from "@rbxts/services";
import { GlobalEvents } from "shared/network";

const OnRequestSharedClasses = new Signal<(Player: Player) => void>();
const RequestedPlayers = new Set<Player>();

if (RunService.IsServer()) {
    GlobalEvents.server.OnRequestSharedClasses.connect((player) => {
        if (RequestedPlayers.has(player)) return;
        RequestedPlayers.add(player);
        OnRequestSharedClasses.Fire(player);
    });
}
enum PackageType {
    callMethod
}

interface SharedClass {
    Constructor: Constructor;
    OnCreate: Signal<(instance: object) => void>;
    OnPlayerReplicated: Signal<(instance: object, player: Player) => void>;
    NonSynchronized: Set<string>;
}

interface IPackageCallMethod {
    methodName: string;
    args: unknown[];
}

const SharedClasses = new Map<string, SharedClass>();
const SharedInstances = new Map<object, {
    RemoteEvent: RemoteEvent;
    IsInitedClient: boolean;
    Maid: Maid;
}>();
let SharedClassesFolder: Folder;

if (RunService.IsClient()) {
    GlobalEvents.client.CreateClassInstance.connect((objectName, args, remoteEvent, properties, clientMethodInitName) => {
        if (!SharedClasses.has(objectName)) {
            warn(`Class ${objectName} does not exist but server sent it`);
            return;
        }
    
        const object = SharedClasses.get(objectName)!;
        
        const instance = new object.Constructor(remoteEvent as never, ...(args as never[]));

        properties.forEach((data, propertyName) => {
            instance[propertyName as never] = data as never;
        });

        if (clientMethodInitName) {
            (instance[clientMethodInitName as never] as Callback)(instance);
        }
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

    const instance = SharedInstances.get(object);
    assert(instance, 'This class is not shared. Please use @SharedClass');

    instance.RemoteEvent.FireAllClients(methodType, data);
}

const getSharedClass = (object: object) => {
    if (!SharedClasses.has(`${object}`)) {
        SharedClasses.set(`${object}`, {
            Constructor: object as Constructor,
            OnCreate: new Signal(),
            OnPlayerReplicated: new Signal(),
            NonSynchronized: new Set()
        });
    }

    return SharedClasses.get(`${object}`)!;
}

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

export const NonSyncProperty = () => {
    return (object: object, propertyName: string) => {
        const sharedClass = getSharedClass(object);
        sharedClass.NonSynchronized.add(propertyName);
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

    Object.keys(object as Record<string, unknown>).forEach((propertyName) => {
        if (sharedClass.NonSynchronized.has(propertyName)) {
            return;
        }

        const value = object[propertyName as never] as unknown;

        if (typeIs(value, 'table') && getmetatable(value) !== undefined) {
            //warn(`Tables with metatables cannot be replicated ${propertyName}`);
            return;
        }

        data.set(propertyName, object[propertyName as never]);
    });

    return data
}

const HaveDestroyMethod = (object: object): object is { Destroy: Callback }  => 'Destroy' in object && typeIs(object.Destroy, 'function');

interface SharedClassConfig<K extends string | number | symbol = string, D extends string | number | symbol = string> {
    ClientMethodInitName?: K,
    DestroyMethodName?: D
}

type ExtractMethods <C> = ExtractMembers<C, Callback>

export const SharedClass = <T extends object, K extends keyof ExtractMethods<T>, D extends ExtractMethods<T>>({
    ClientMethodInitName,
    DestroyMethodName
}: SharedClassConfig<K, keyof D>) => {
    return (object: Constructor<T>) => {
        const objectWithconstructor = object as unknown as { constructor: (...args: defined[]) => unknown };
        const originalConstructor = objectWithconstructor.constructor;
    
        getSharedClass(object);
    
        let freeId = 0;

        objectWithconstructor.constructor = function(this, ...args: defined[]) {
            const maid = new Maid();
            let remoteEvent: RemoteEvent;
            const players = new Set<Player>();

            // Server code
            if (RunService.IsServer()) {
                originalConstructor(this, ...args);
                
                remoteEvent = createRemoteEvent(`${object}${freeId}`);
                SharedInstances.set(this, {
                    RemoteEvent: remoteEvent,
                    Maid: maid,
                    IsInitedClient: false
                });
                freeId++;
                GlobalEvents.server.CreateClassInstance.broadcast(`${object}`, args, remoteEvent, generateReplicatedProperties(this), ClientMethodInitName);

                maid.GiveTask(remoteEvent);
                maid.GiveTask(() => SharedInstances.delete(this));

                maid.GiveTask(OnRequestSharedClasses.Connect((player) => {
                    GlobalEvents.server.CreateClassInstance.fire(player, `${object}`, args, remoteEvent, generateReplicatedProperties(this), ClientMethodInitName);
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

            SharedInstances.set(this, {
                RemoteEvent: remoteEvent,
                Maid: maid,
                IsInitedClient: false
            });
            initClientPackageParser(this, remoteEvent);
           
            args.remove(0);

            originalConstructor(this, ...args);
            remoteEvent.FireServer();
        }

        if (DestroyMethodName || HaveDestroyMethod(objectWithconstructor)) {
            const objectWithDestroy = objectWithconstructor as unknown as { Destroy: (...args: defined[]) => void }; 
            const originalDestroy = objectWithDestroy[(DestroyMethodName || 'Destroy') as never] as Callback;

            const callback: typeof objectWithDestroy['Destroy'] = function(this: typeof objectWithDestroy, ...args: defined[]) {
                if (RunService.IsServer()) {
                    SendPackage(this, PackageType.callMethod, {
                        methodName: 'Destroy',
                        args: args,
                    });
                }
                originalDestroy(this, ...args);
                SharedInstances.get(this)!.Maid.DoCleaning();
            };

            objectWithDestroy[(DestroyMethodName || 'Destroy') as never] = callback as never;
        }
    }
}