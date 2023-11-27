import Maid from "@rbxts/maid";
import { WaveState } from "../WaveState";
import { WaveAction } from "../WaveAction";
import { Enemy } from "shared/Classes/Enemy";

export class WaveMain extends WaveState {
    private maid = new Maid();

    public CulculateActionsTime(actions: WaveAction[]): number {
        let time = 0;

        actions.forEach((value) => {
            time += value.GetTimeToEndAction();
        });

        return time;
    }

    public Invoke(): void {
        const wave = this.wavesHadler.GetWaveInfo();
        const actions = this.wavesHadler.GetWaveActions()

        this.maid.GiveTask(coroutine.running());
        this.maid.GiveTask(this.wavesHadler.OnTimeEnd.Connect(() => {
            this.wavesHadler.NextWave();
        }));

        const time = !this.wavesHadler.IsLastWave() ? this.CulculateActionsTime(actions) + wave.AdditionalTime : 3599;
        this.wavesHadler.SetTime(time);

        this.maid.GiveTask(Enemy.OnDiedEnemy.Connect(() => {
            task.wait();
            if (Enemy.Enemies.size() === 0) {
                this.wavesHadler.NextWave();
            }
        }));

        actions.forEach((action) => {
            action.Execute();
        });

        if (!this.wavesHadler.IsLastWave()) {
            this.wavesHadler.EnableVoteSkipWave();
        }

        if (Enemy.Enemies.size() === 0) {
            this.wavesHadler.NextWave();
        }
    }
    public Destroy(): void {
        this.maid.DoCleaning();
    }
}