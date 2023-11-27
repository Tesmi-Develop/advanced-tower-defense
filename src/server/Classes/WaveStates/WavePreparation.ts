import Maid from "@rbxts/maid";
import { WaveState } from "../WaveState";
import { Dependency } from "@flamework/core";
import { Components } from "@flamework/components";
import { PlayerComponent } from "server/components/PlayerComponent";
import { WaveMain } from "./WaveMain";

export class WavePreparation extends WaveState {
    private maid = new Maid();

    public Invoke(): void {
        this.maid.GiveTask(this.wavesHadler.OnTimeEnd.Connect(() => {
            this.wavesHadler.ChangeState(new WaveMain(this.wavesHadler));
        }));

        const waveSettings = this.wavesHadler.GetGameConfig();
        this.wavesHadler.SetTime(waveSettings.PreparationTime);

        const components = Dependency(Components);
        components.getAllComponents<PlayerComponent>().forEach((player) => {
            player.GiveMoney(this.wavesHadler.GetWaveInfo().Cash);
        });
    }

    public Destroy(): void {
        this.maid.DoCleaning();
    }
}