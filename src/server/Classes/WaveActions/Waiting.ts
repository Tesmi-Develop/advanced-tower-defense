import { IWaveAction } from "Types/Wave/IWaveAction";
import { WaveAction, WaveActionDecorator } from "../WaveAction";
import { $terrify } from "rbxts-transformer-t-new";

@WaveActionDecorator
export class Waiting extends WaveAction<{
    time: number;
} & IWaveAction> {

    public GetTimeToEndAction(): number {
        return this.config.time;
    }
    
    public Validate(): boolean {
        const checker = $terrify<typeof this.config>();

        return checker(this.config);
    }

    public Execute(): void {
        task.wait(this.config.time);
    }
}