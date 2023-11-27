import { WavesHadler } from "./WaveHandler";


export abstract class WaveState {
    protected wavesHadler: WavesHadler;

    constructor(wavesHadler: WavesHadler) {
        this.wavesHadler = wavesHadler;
    }
    
    public abstract Invoke(): void;
    public abstract Destroy(): void;
}