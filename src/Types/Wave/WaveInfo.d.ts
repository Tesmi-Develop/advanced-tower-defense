import { IWaveAction } from "./IWaveAction";

export interface WaveInfo {
    Actions: Array<IWaveAction>;
    AdditionalTime: number;
    Cash: number;
}