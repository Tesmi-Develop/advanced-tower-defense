import { Constructor } from "@rbxts/component";
import { IWaveAction } from "Types/Wave/IWaveAction";

const waveActions = new Map<string, Constructor<WaveAction>>();
export const WaveActions = waveActions as ReadonlyMap<string, Constructor<WaveAction>>; 

export const WaveActionDecorator = <T extends Constructor<WaveAction>>(object: T) => {
    waveActions.set(`${object}`, object);
}

export abstract class WaveAction<T extends IWaveAction = IWaveAction> {
    protected config: T;

    constructor(config: T) {
        this.config = config;
    }

    public abstract GetTimeToEndAction(): number;

    public abstract Validate(): boolean;

    public abstract Execute(): void;
}