interface IGameConfig {
    StartingCash: number;
    BaseHealth: number;
    RadiusRestrictedArea: number;
    WaveConfig: {
        TimeToStart: number;
        PreparationTime: number;
    }
}