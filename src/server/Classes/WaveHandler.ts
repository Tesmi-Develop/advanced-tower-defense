import Signal from "@rbxts/signal";
import { GlobalDataReplica } from "Types/Data/Replica";
import { WaveInfo } from "Types/Wave/WaveInfo";
import { $terrify } from "rbxts-transformer-t-new";
import { GameService } from "server/services/GameService";
import { WaveAction, WaveActions } from "./WaveAction";
import { WaveStart } from "./WaveStates/WaveStart";
import { Spawn } from "shared/decorators/Methods/Spawn";
import { GetCurrentTime } from "shared/Utility/Utility";
import { WaveState } from "./WaveState";
import { WavePreparation } from "./WaveStates/WavePreparation";
import { Players } from "@rbxts/services";

const waveInfoChecker = $terrify<WaveInfo>();

export class WavesHadler {
    public readonly OnStartTime = new Signal<(time: number) => void>();
    public readonly OnTimeEnd = new Signal<() => void>();
    public readonly OnEndLastWave = new Signal<() => void>();
    public readonly OnEndWave = new Signal<(index: number) => void>();
    public readonly OnNextWave = new Signal<(index: number) => void>();
    private replica: GlobalDataReplica;
    private gameService: GameService;
    private isStart = false;
    private waves!: WaveInfo[];
    private wave!: WaveInfo;
    private maxWaves = 0;
    private waveIndex = 0;
    private waveActions: WaveAction[][] = [];
    private config!: IGameConfig['WaveConfig'];
    private isTimeEnd = true;
    private state: WaveState = new WaveStart(this);
    private stateThread?: thread;

    constructor(gameService: GameService) {
        this.gameService = gameService;
        this.replica = gameService.GetReplicaAsync();
    }

    public GetWaveInfo() {
        return this.wave;
    }

    public GetWaveActions() {
        return this.waveActions[this.waveIndex];
    }

    public GetWaveIndex() {
        return this.waveIndex;
    }

    public GetMaxWaves() {
        return this.maxWaves;
    }

    public IsLastWave() {
        return this.waveIndex === this.maxWaves - 1;
    }

    public GetGameConfig() {
        return this.config;
    }

    public EnableVoteSkipWave() {
        if (this.replica.Data.IsEnableVote) return;

        this.replica.SetValue('Voted', []);
        this.replica.SetValue('NeedCountVoted', math.round(Players.GetPlayers().size() / 2));
        this.replica.SetValue('IsEnableVote', true);
    }

    private onUpdateVote() {
        if (!this.replica.Data.IsEnableVote) return;

        const needCountVoted = this.replica.Data.NeedCountVoted;
        const countConfirm = this.replica.Data.CountConfirm;

        if (countConfirm >= needCountVoted) {
            this.endVoting();
            this.NextWave();
        }
    }

    private endVoting() {
        this.replica.SetValue('IsEnableVote', false);
    }

    public OnVote(player: Player, confirm: boolean): boolean {
        if (!this.replica.Data.IsEnableVote) return false;

        const voted = this.replica.Data.Voted;
        if (voted.includes(player)) return false;

        if (confirm) {
            const value = this.replica.Data.CountConfirm + 1;
            this.replica.SetValue('CountConfirm', value);
            this.onUpdateVote();
        }

        this.replica.ArrayInsert('Voted', player);

        return true;
    }

    public ChangeState(state: WaveState) {
        if (this.stateThread) {
            pcall(() => task.cancel(this.stateThread!));
        }
        this.state?.Destroy();
        this.state = state;
        state.Invoke();
    }

    public NextWave() {
        if (this.replica.Data.IsEnableVote) {
            this.endVoting();
        }

        if (!this.waves[this.waveIndex + 1]) {
            task.wait(3);
            print('win');
            return;
        }

        print('Next wave ' + tostring(this.waveIndex + 2));

        this.waveIndex += 1;
        this.replica.SetValue('Wave', this.waveIndex + 1);
        this.wave = this.waves[this.waveIndex];
        this.ChangeState(new WavePreparation(this));
        this.OnNextWave.Fire(this.waveIndex);
    }

    public StartFirstWave() {
        this.waveIndex = -1;
        this.NextWave();
    }

    private initEvents() {
        // TODO
        
    }

    private initWaves() {
        this.waves.forEach((waveInfo, index) => {
            assert(waveInfoChecker(waveInfo), `WaveInfo is not valid, wave: ${index + 1}`);

            waveInfo.Actions.forEach((action, actionIndex) => {
                const waveActionConstructor = WaveActions.get(action.ActionName);
                assert(waveActionConstructor, `WaveActionName is not valid, wave: ${index + 1}, actionIndex: ${actionIndex + 1}`);

                const waveAction = new waveActionConstructor(action);
                assert(waveAction.Validate(), `WaveAction not passed validate, wave: ${index + 1}, actionIndex: ${actionIndex + 1}`);

                let actions = this.waveActions[index];
                if (!actions) {
                    this.waveActions[index] = [];
                    actions = this.waveActions[index];
                }

                actions[actionIndex] = waveAction;
            });
        });

        this.wave = this.waves[0];
    } 

    @Spawn
    private initTimer() {
        while(true) {
            task.wait();

            if (this.isTimeEnd) continue;

            const currentTime = GetCurrentTime();
            if (currentTime > this.replica.Data.EndTime && !this.isTimeEnd) {
                this.isTimeEnd = true;
                this.OnTimeEnd.Fire();
                continue;
            }
        }
    }

    public SetTime(time: number) {
        if (this.isTimeEnd) {
            this.OnStartTime.Fire(time);
        }

        this.isTimeEnd = false;
        this.replica.SetValue('EndTime', GetCurrentTime() + time);
    }

    public Start(waves: WaveInfo[]) {
        if (this.isStart) return;

        this.isStart = true;
        this.waves = waves;
        this.maxWaves = waves.size();
        this.config = this.gameService.GetConfig().WaveConfig;
        
        this.initWaves();

        this.initEvents();
        this.initTimer();
        this.state.Invoke();
    }
}