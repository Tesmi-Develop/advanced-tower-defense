import { IWaveAction } from "Types/Wave/IWaveAction";
import { WaveAction, WaveActionDecorator } from "../WaveAction";
import { Enemy, IEnemyConfig } from "shared/Classes/Enemy";
import { $terrify } from "rbxts-transformer-t-new";

@WaveActionDecorator
export class SpawnEnemies extends WaveAction<{
    Enemy: IEnemyConfig;
    count: number;
	delay: number;
} & IWaveAction> {

    public GetTimeToEndAction(): number {
        return this.config.count * this.config.delay;
    }

    public Validate(): boolean {
        const checker = $terrify<typeof this.config>();

        return checker(this.config);
    }

    public Execute(): void {
        for (const i of $range(1, this.config.count)) {
            const enemy = new Enemy(this.config.Enemy);
            enemy.Init();

            task.wait(this.config.delay);
        }
    }
    
}