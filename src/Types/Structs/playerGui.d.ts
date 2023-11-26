interface PlayerGui extends Instance {
    Main: ScreenGui & {
        WaveCounter: TextLabel;
        BaseHealthBar: CanvasGroup & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            Anount: TextLabel & {
                UIStroke: UIStroke;
            };
            Fill: Frame;
        };
    }
    HoverGui: ScreenGui & {
        Keybinds: Frame & {
            UIListLayout: UIListLayout;
            Template: Frame & {
                Icon: Frame & {
                    Console: ImageLabel;
                    TextLabel: TextLabel;
                    RMB: ImageLabel;
                    Bumper: ImageLabel;
                    LMB: ImageLabel;
                    PC: ImageLabel;
                    DoubleTap: ImageLabel;
                };
                Title: TextLabel & {
                    UITextSizeConstraint: UITextSizeConstraint;
                };
                Bg: ImageLabel;
            };
        };
        Towers: Frame & {
            Owner: ImageLabel & {
                Corner: ImageLabel;
                TextLabel: TextLabel & {
                    ["Text Size"]: UITextSizeConstraint;
                };
            };
            Level: TextLabel & {
                ["Text Size"]: UITextSizeConstraint;
            };
            Title: TextLabel & {
                ["Text Size"]: UITextSizeConstraint;
            };
        };
        Units: Frame & {
            Attributes: Frame & {
                Range: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                UIListLayout: UIListLayout;
                ExplosionDamage: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Cooldown: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Damage: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
            };
            Health: Frame & {
                Count: TextLabel & {
                    ["Text Size"]: UITextSizeConstraint;
                };
                Bar: Frame & {
                    Holder: ImageLabel & {
                        UIGradient: UIGradient;
                    };
                };
            };
            Title: ImageLabel & {
                Corner: ImageLabel;
                TextLabel: TextLabel & {
                    ["Text Size"]: UITextSizeConstraint;
                };
            };
            Bar: ImageLabel;
        };
        Enemies: Frame & {
            Health: Frame & {
                Shield: Frame & {
                    Holder: ImageLabel & {
                        UIGradient: UIGradient;
                    };
                };
                Count: TextLabel & {
                    ["Text Size"]: UITextSizeConstraint;
                };
                Bar: Frame & {
                    Holder: ImageLabel & {
                        UIGradient: UIGradient;
                    };
                };
            };
            Attributes: Frame & {
                Defense: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Floating: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                UIListLayout: UIListLayout;
                Explosion: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Lead: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Hidden: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Ghost: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Fire: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Energy: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
                Freeze: ImageLabel & {
                    Icon: ImageLabel;
                    TextLabel: TextLabel;
                };
            };
            Title: ImageLabel & {
                Corner: ImageLabel;
                TextLabel: TextLabel & {
                    ["Text Size"]: UITextSizeConstraint;
                };
            };
            Bar: ImageLabel;
        };
    }
    
}