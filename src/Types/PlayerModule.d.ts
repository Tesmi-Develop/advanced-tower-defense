export interface Controls {
    Disable(): void;
    Enable(): void;
}

export interface PlayerModule extends ModuleScript{
    GetControls(): Controls;
}