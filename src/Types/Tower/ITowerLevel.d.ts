import { ITowerModuleConfig } from "./ITowerModuleConfig";

export interface ITowerLevel {
    Model: Model;
    Price: number;
    IdleAnimation: Animation;
    ModuleConfigs: ITowerModuleConfig[]; 
}