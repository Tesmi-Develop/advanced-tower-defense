import { ITowerLevel } from "./ITowerLevel";

export interface TowerConfig {
    Name: string;
    DisplayName: string;
    Placing: string;
    Logo: number;
    Levels: ITowerLevel[];
}