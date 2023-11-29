import { Flamework } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { TowerConfig } from "Types/Tower/TowerConfig";
import Collision from "shared/Collisions";
import { SharedClass } from "shared/SharedDecorators/SharedDecorators";
import { Spawn } from "shared/decorators/Methods/Spawn";

const checker = Flamework.createGuard<Map<string, Omit<TowerConfig, 'Name'>>>();
const towers = require(ReplicatedStorage.WaitForChild('Content').WaitForChild('Towers') as ModuleScript) as Record<string, TowerConfig>;

@SharedClass()
export class Tower {
    public static readonly TowerConfigs: Map<string, TowerConfig> = new Map();
    private owner: Player;
    private position: Vector3;
    private config: TowerConfig;
    private model!: Model;

    constructor(player: Player, position: Vector3, config: TowerConfig) {
        this.owner = player;
        this.position = position;
        this.config = config;
    }

    public static StaticInitTowerConfigs() {
        Object.keys(towers).forEach((key) => {
            towers[key].Name = key;
            this.TowerConfigs.set(key, towers[key]);
        });

        assert(checker(this.TowerConfigs), 'TowerConfigs is not valid');
    }

    public static GetTowerConfigByName(name: string) { return this.TowerConfigs.get(name); }

    public GetOwner() { return this.owner; }

    public GetPosition() { return this.position; }

    public SetRestrictedAreaPosition(position: Vector3) {
        //this.restrictedArea.Position = position;
    }

    private initModel() {
        this.model = this.config.Model.Clone();
        this.model.Parent = Workspace;
        this.model.MoveTo(this.position);
    }

    private initCollision(): void {
        this.model.GetDescendants().forEach((value) => {
            if (!value.IsA('BasePart')) return;

            value.CollisionGroup = Collision.Tower;
        });
    }

    private initAnimations() {
        
    }

    private initTag() {
        //CollectionService.AddTag(this.model, 'Tower');
    }

    private createRestrictedArea() {
        /*const GameService = KnitServer.GetService('GameService');
        const settings = GameService.GetSettings('GameSettings') as GameSettings;
        const modelPosition = this.model.GetPivot().Position;
        const params = new RaycastParams();
        params.FilterDescendantsInstances = [this.model];
        params.FilterType = Enum.RaycastFilterType.Exclude;

        const result = Workspace.Raycast(modelPosition, new Vector3(0, -1, 0).mul(500), params);
        const position = result?.Position as Vector3;

        this.restrictedArea.Anchored = true;
        this.restrictedArea.CanCollide = false;
        this.restrictedArea.Transparency = 1;
        this.restrictedArea.Shape = Enum.PartType.Cylinder;
        this.restrictedArea.Color = Color3.fromRGB(255, 0, 0);
        this.restrictedArea.Size = new Vector3(0.2, settings.RadiusRestrictedArea * 2, settings.RadiusRestrictedArea * 2);
        this.restrictedArea.Orientation = new Vector3(0, 0, 90);
        this.restrictedArea.Position = position;
        this.restrictedArea.TopSurface = Enum.SurfaceType.Smooth;
        this.restrictedArea.BottomSurface = Enum.SurfaceType.Smooth;

        CollectionService.AddTag(this.restrictedArea, 'RestrictedArea');*/
    }

    public Destroy() {
        
    }

    @Spawn
    public Init() {
        
    }

    public InitClient() {
        this.initModel();
        this.initCollision();
    }
}