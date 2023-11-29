interface IGameConfig {
    StartingCash: number;
    BaseHealth: number;
    CountTowerSlots: number;
    RadiusRestrictedArea: number;
    WaveConfig: {
        TimeToStart: number;
        PreparationTime: number;
    }
}