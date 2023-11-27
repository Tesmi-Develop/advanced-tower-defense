interface ReplicatedStorage extends Instance {
    Configs: Folder & {
        Config: ModuleScript;
    };
    Content: Folder & {
        Enemies: ModuleScript;
        Waves: Folder & {
            Easy: ModuleScript;
        };
    }
    Assets: Folder & {
        Towers: Folder & {
            Gladiator: Model;
        }
        Worker: Model;
        Zombie: Model & {
            AnimationController: AnimationController & {
                Animator: Animator;
            };
            ["Right Leg"]: MeshPart;
            Head: MeshPart & {
                face: Decal;
            };
            Torso: MeshPart & {
                ["Left Shoulder"]: Motor6D;
                ["Right Shoulder"]: Motor6D;
                Neck: Motor6D;
                ["Right Hip"]: Motor6D;
                ["Left Hip"]: Motor6D;
            };
            HumanoidRootPart: Part & {
                RootJoint: Motor6D;
            };
            ["Right Arm"]: MeshPart;
            ["Left Arm"]: MeshPart;
            AnimSaves: Model & {
                Walk: KeyframeSequence;
            };
            ["Left Leg"]: MeshPart;
        };
        Walk: Animation;
    }
}
