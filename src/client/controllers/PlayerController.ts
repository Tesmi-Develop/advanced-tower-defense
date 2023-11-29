import { Controller, OnStart, OnInit, Modding } from "@flamework/core";
import Signal from "@rbxts/rbx-better-signal";
import { ReplicaController } from "@rbxts/replicaservice";
import { GlobalDataReplica, PlayerReplica } from "Types/Data/Replica";
import { Events } from "client/network";
import { Enemy } from "shared/Classes/Enemy";
import { Tower } from "shared/Classes/Tower";

export interface OnReplicaCreated {
    onReplicaCreated(replica: PlayerReplica): void;
}

export interface OnGlobalReplicaCreated {
    OnGlobalReplicaCreated(replica: GlobalDataReplica): void;
}

@Controller({})
export class PlayerController implements OnStart, OnInit {
    private playerReplica!: PlayerReplica;
    private waitingForReplicaSignal?: Signal<(replica: PlayerReplica) => void>;
    private globalReplica!: GlobalDataReplica;
    private waitingForGlobalReplicaSignal?: Signal<(replica: GlobalDataReplica) => void>;
    
    onInit() {
        this.initOnReplicaCreated();
        this.initOnGlobalReplicaCreated();
        this.initReplicas();
    }

    private initReplicas() {
        ReplicaController.ReplicaOfClassCreated('PlayerData', (replica) => {
            this.playerReplica = replica;
            this.waitingForReplicaSignal?.Fire(replica);
            this.waitingForReplicaSignal?.Destroy();
        });

        ReplicaController.ReplicaOfClassCreated('GlobalData', (replica) => {
            this.globalReplica = replica;
            this.waitingForGlobalReplicaSignal?.Fire(replica);
            this.waitingForGlobalReplicaSignal?.Destroy();
        });
    }

    public GetPlayerReplicaAsync() {
        if (this.playerReplica) return this.playerReplica;

        if (this.waitingForReplicaSignal === undefined) this.waitingForReplicaSignal = new Signal();
        const [replica] = this.waitingForReplicaSignal.Wait();

        return replica;
    }

    public GetGlobalReplicaAsync() {
        if (this.globalReplica) return this.globalReplica;

        if (this.waitingForGlobalReplicaSignal === undefined) this.waitingForGlobalReplicaSignal = new Signal();
        const [replica] = this.waitingForGlobalReplicaSignal.Wait();

        return replica;
    }

    private initOnReplicaCreated() {
        const listeners = new Set<OnReplicaCreated>();

        Modding.onListenerAdded<OnReplicaCreated>((object) => object.onReplicaCreated(this.GetPlayerReplicaAsync()));
        Modding.onListenerRemoved<OnReplicaCreated>((object) => listeners.delete(object));

        listeners.forEach((value) => {
            task.spawn(() => value.onReplicaCreated(this.GetPlayerReplicaAsync()));
        });
    }

    private initOnGlobalReplicaCreated() {
        const listeners = new Set<OnGlobalReplicaCreated>();

        Modding.onListenerAdded<OnGlobalReplicaCreated>((object) => object.OnGlobalReplicaCreated(this.GetGlobalReplicaAsync()));
        Modding.onListenerRemoved<OnGlobalReplicaCreated>((object) => listeners.delete(object));

        listeners.forEach((value) => {
            task.spawn(() => value.OnGlobalReplicaCreated(this.GetGlobalReplicaAsync()));
        });
    }

    onStart() {
        Events.OnRequestSharedClasses.fire();
        ReplicaController.RequestData();
    }
}