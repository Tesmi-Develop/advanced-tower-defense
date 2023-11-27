import Maid from "@rbxts/maid";
import { WaveState } from "../WaveState";

export class WaveStart extends WaveState {
    private maid = new Maid();

    public Invoke(): void {
        this.maid.GiveTask(this.wavesHadler.OnTimeEnd.Connect(() => {
            this.wavesHadler.StartFirstWave();
        }));

        const waveSettings = this.wavesHadler.GetGameConfig();
        print('wave start')
        this.wavesHadler.SetTime(waveSettings.TimeToStart);
    }

    public Destroy(): void {
        this.maid.DoCleaning();
    }
}