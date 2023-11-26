import { Service, OnStart, OnInit } from "@flamework/core";
import Signal from "@rbxts/rbx-better-signal";
import { ReplicaService } from "@rbxts/replicaservice";
import { ReplicatedStorage } from "@rbxts/services";
import { GlobalDataReplica } from "Types/Data/Replica";
import { $terrify } from "rbxts-transformer-t-new";
import { Base } from "server/Classes/Base";
import { Enemy } from "shared/Classes/Enemy";
import { Spawn } from "shared/decorators/Methods/Spawn";

const token = ReplicaService.NewClassToken('GlobalData');

@Service({})
export class GameService implements OnStart, OnInit {
    private replica!: GlobalDataReplica;
    private waitingReplica?: Signal;
    private config!: IGameConfig;
    private base!: Base;

    onInit() {
        
    }

    public GetBase() { return this.base; }

    public GetReplicaAsync() {
        if (this.replica) return this.replica;
        if (!this.waitingReplica) {
            this.waitingReplica = new Signal();
        }

        this.waitingReplica.Wait();
        return this.replica;
    }

    private initReplica() {
        this.replica = ReplicaService.NewReplica({
            ClassToken: token,
			Data: {
				BaseHealth: 100,
                BaseMaxHealth: 100,
                Wave: 0,
                Config: this.config,
			},
			Replication: 'All',
        });

        this.waitingReplica?.Fire();
    }

    private initGameConfig() {
        const moduleScript = ReplicatedStorage.Configs.Config;
        const config = require(moduleScript);
        const checker = $terrify<IGameConfig>();
        assert(checker(config), 'Config is not valid');
        
        this.config = config;
    }

    private initBase() {
        this.base = new Base(this.replica);
        this.base.Init();
    }

    @Spawn
    private testEnemy() {
        for (const i of $range(0, 10)) {
            const enemy = new Enemy({
                Name: 'Test',
                Model: ReplicatedStorage.Assets.Zombie,
                Health: 3,
                WalkAnimation: ReplicatedStorage.Assets.Walk,
                Walkspeed: 6,
            });
            enemy.Init();
            task.wait(1);
        }
    }

    onStart() {
        this.initGameConfig();
        this.initReplica();
        this.initBase();
        this.testEnemy();
    }
}