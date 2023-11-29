import { Service, OnStart, OnInit } from "@flamework/core";
import Signal from "@rbxts/rbx-better-signal";
import { ReplicaService } from "@rbxts/replicaservice";
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { GlobalDataReplica } from "Types/Data/Replica";
import { WaveInfo } from "Types/Wave/WaveInfo";
import { $terrify } from "rbxts-transformer-t-new";
import { Base } from "server/Classes/Base";
import { WavesHadler } from "server/Classes/WaveHandler";

const token = ReplicaService.NewClassToken('GlobalData');

@Service({})
export class GameService implements OnStart, OnInit {
    private replica!: GlobalDataReplica;
    private waitingReplica?: Signal;
    private config!: IGameConfig;
    private base!: Base;
    private waveHandler!: WavesHadler;

    onInit() {
        
    }

    public GetWaveHandler() { return this.waveHandler; }
    public GetConfig() { return this.config; }
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
                EndTime: 0,
                Voted: [],
                CountConfirm: 0,
                NeedCountVoted: 0,
                IsEnableVote: false,
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

    private initWaveHandler() {
        // TODO
        this.waveHandler = new WavesHadler(this);
        this.waveHandler.Start(require(ReplicatedStorage.Content.Waves.Easy) as WaveInfo[]);
    }

    onStart() {
        this.initGameConfig();
        this.initReplica();
        this.initBase();
        this.initWaveHandler();
    }
}