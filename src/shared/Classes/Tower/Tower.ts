import { Dependency, Flamework } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { TowerConfig } from "Types/Tower/TowerConfig";
import Collision from "shared/Collisions";
import { SharedClass, SharedMethod } from "shared/SharedDecorators/SharedDecorators";
import { Spawn } from "shared/decorators/Methods/Spawn";
import type { GameService } from "server/services/GameService"
import Tags from "shared/Tags";
import { TowerModule } from "./TowerModule";
import { AnimatorComponent } from "../AnimatorComponent";
import { ITowerLevel } from "Types/Tower/ITowerLevel";
import { TowerModules } from "shared/decorators/TowerModuleDecorator";

const checker = Flamework.createGuard<Map<string, Omit<TowerConfig, 'Name'>>>();
const towers = require(ReplicatedStorage.WaitForChild('Content').WaitForChild('Towers') as ModuleScript) as Record<string, TowerConfig>;

@SharedClass({
    ClientMethodInitName: 'InitClient',
})
export class Tower {
    public static readonly TowerConfigs: Map<string, TowerConfig> = new Map();
    private owner: Player;
    private position: Vector3;
    private config: TowerConfig;
    private model!: Model;
    private restrictedArea!: Part;
    private lookCFrame = new CFrame();
    private animatorComponent!: AnimatorComponent;
    private humanoid!: Humanoid;
    private levelIndex: number;
    private level: ITowerLevel;
    private rotation = 0;
    private modules: TowerModule[] = [];

    constructor(player: Player, position: Vector3, config: TowerConfig, level = 1) {
        assert(!config.Levels.isEmpty(), 'TowerConfig.Levels is empty');

        this.owner = player;
        this.position = position;
        this.config = config;
        this.levelIndex = level - 1;
        this.level = config.Levels[level - 1];
    }

    public static StaticInitTowerConfigs() {
        Object.keys(towers).forEach((key) => {
            towers[key].Name = key;
            this.TowerConfigs.set(key, towers[key]);
        });

        assert(checker(this.TowerConfigs), 'TowerConfigs is not valid');
    }

    public static GetTowerConfigByName(name: string) { return this.TowerConfigs.get(name); }

    public GetAnimatorComponent() { return this.animatorComponent; }

    public GetOwner() { return this.owner; }

    public GetPosition() { return this.position; }

    public IsMaxLevel() {
        return this.config.Levels.size() - 1 <= this.levelIndex;
    }

    public GetNextLevel() {
        if (this.IsMaxLevel()) return;

        return this.config.Levels[this.levelIndex];
    }

    public Upgrade() {
        if (this.IsMaxLevel()) return;

        this.levelIndex += 1;

        new Tower(this.owner, this.position, this.config, this.levelIndex).Init();
        this.Destroy();
    }

    @SharedMethod()
    public SetRotation(rotation: CFrame) {
        const [x, y, z] = rotation.ToOrientation();
        this.rotation = math.deg(y);
        this.lookCFrame = rotation;

        if (RunService.IsClient()) {
            this.model.PivotTo(new CFrame(this.model.GetPivot().Position).mul(CFrame.Angles(0, math.rad(this.rotation), 0)));
        }
    }

    private getLowestY() {
        let lowestY = math.huge;
        let part: (BasePart | undefined);

        this.model.GetChildren().forEach((instance) => {
            if (!instance.IsA('BasePart')) return;

            if (instance.Position.Y < lowestY) {
                lowestY = instance.Position.Y;
                part = instance;
            }
        });

        if (part) {
            lowestY -= part.Size.Y / 2;
        }

        return lowestY;
    }

    private initHumanoid() {
        const humanoid = this.model.FindFirstChildOfClass('Humanoid') || new Instance('Humanoid', this.model);
        humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None;
        humanoid.DisplayName = '';
        humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff;

        humanoid.SetStateEnabled('Physics', false);
        humanoid.SetStateEnabled('Ragdoll', false);
        humanoid.SetStateEnabled('FallingDown', false);
        humanoid.SetStateEnabled('Freefall', false);

        this.humanoid = humanoid;
    }

    private initModel() {
        this.model = this.level.Model.Clone();
        this.model.Parent = Workspace;

        const lowestY = this.getLowestY();

        this.model.PivotTo(new CFrame(new Vector3(this.position.X, lowestY, this.position.Z)));
        this.initHumanoid();
    }

    private initCollision() {
        this.model.GetDescendants().forEach((value) => {
            if (!value.IsA('BasePart')) return;

            value.CollisionGroup = Collision.Tower;
        });
    }

    private createRestrictedArea() {
        const gameService = Dependency<GameService>();
        const radiusRestrictedArea = gameService.GetConfig().RadiusRestrictedArea;
        const params = new RaycastParams();
        params.FilterDescendantsInstances = [this.model];
        params.FilterType = Enum.RaycastFilterType.Exclude;

        const result = Workspace.Raycast(this.position, Vector3.yAxis.mul(-500), params);
        const position = result?.Position as Vector3;

        this.restrictedArea = new Instance('Part', Workspace);
        this.restrictedArea.Anchored = true;
        this.restrictedArea.CanCollide = false;
        this.restrictedArea.Transparency = 1;
        this.restrictedArea.Shape = Enum.PartType.Cylinder;
        this.restrictedArea.Color = Color3.fromRGB(255, 0, 0);
        this.restrictedArea.Size = new Vector3(0.2, radiusRestrictedArea * 2, radiusRestrictedArea * 2);
        this.restrictedArea.Orientation = new Vector3(0, 0, 90);
        this.restrictedArea.Position = position;
        this.restrictedArea.TopSurface = Enum.SurfaceType.Smooth;
        this.restrictedArea.BottomSurface = Enum.SurfaceType.Smooth;

        this.restrictedArea.AddTag(Tags.RestrictedArea);
    }

    public Destroy() {
        this.model?.Destroy();
        this.restrictedArea?.Destroy();
        this.modules.forEach((module) => module.Destroy());
    }

    private initAnimator() {
        const animator = this.humanoid.FindFirstChildOfClass('Animator') || new Instance('Animator', this.humanoid);
        this.animatorComponent = new AnimatorComponent(animator);
    }

    private initTowerModules() {
        this.level.ModuleConfigs.forEach((config) => {
            const moduleConstructor = TowerModules.get(config.Name);
            assert(moduleConstructor, `Module ${config.Name} not found`);

            const module = new moduleConstructor(this as never, config as never);
            this.modules.push(module);
            module.Init();
        });
    }

    @Spawn
    public Init() {
        this.initTowerModules();
        this.createRestrictedArea();
    }

    public InitClient() {
        this.initModel();
        this.initAnimator();
        this.initCollision();
        this.animatorComponent.ChangeAnimation(this.level.IdleAnimation);
    }
}