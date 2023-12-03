import { Controller, OnInit } from "@flamework/core";
import { CollectionService, RunService, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { TowerConfig } from "Types/Tower/TowerConfig";
import LocalPlayer from "client/LocalPlayer";
import { Functions } from "client/network";
import Collision from "shared/Collisions";
import Tags from "shared/Tags";

const camera = Workspace.CurrentCamera!;
const PlayerGui = LocalPlayer.WaitForChild('PlayerGui') as PlayerGui;
const PlaceHolderTweenInfo = new TweenInfo(0.3);

@Controller({})
export class PlacingTower implements OnInit {
    private model?: Model;
    private PlaceHolder?: Part;
    private Tower?: TowerConfig;
    private ray?: Ray;
    private ColorAllowsPlace = Color3.fromRGB(79, 120, 237);
    private ColorBanPlace = Color3.fromRGB(255, 0, 0);
    private tweens = new Map<BasePart, Tween>();

    private DisablePreviewTower() {
        if (this.Tower === undefined) return;

        this.Tower = undefined;
        this.model?.Destroy();
        this.model = undefined;
        this.DestroyPlaceHolder();
        //this.TowerIndex = -1;
        this.HideRestrictedArea();
    }

    private ShowRestrictedArea() {
        CollectionService.GetTagged(Tags.RestrictedArea).forEach((value) => {
            const part = value as Part;

            if (this.tweens.has(part)) {
                this.tweens.get(part)!.Destroy();
                this.tweens.delete(part);
            }
            
            const tween = TweenService.Create(part, PlaceHolderTweenInfo, { Transparency: 0.6 });
            tween.Play();
            this.tweens.set(part, tween);
        });
    }

    private HideRestrictedArea() {
        CollectionService.GetTagged(Tags.RestrictedArea).forEach((value) => {
            const part = value as Part;

            if (this.tweens.has(part)) {
                this.tweens.get(part)!.Destroy();
                this.tweens.delete(part);
            }
            
            const tween = TweenService.Create(part, PlaceHolderTweenInfo, { Transparency: 1 });
            tween.Play();
            this.tweens.set(part, tween);
        });
    }

    private DestroyPlaceHolder() {
        if (!this.PlaceHolder) return;

        this.PlaceHolder.Destroy();
        this.PlaceHolder = undefined;
    }

    private CreatePlaceHolder(radius: number, model: Model) {
        const size = model.GetExtentsSize();
        const PlaceHolder = new Instance('Part', Workspace);
        PlaceHolder.Name = 'PlaceHolder';
        PlaceHolder.Anchored = true;
        PlaceHolder.CanCollide = false;
        PlaceHolder.Transparency = 0.6;
        PlaceHolder.Shape = Enum.PartType.Cylinder;
        PlaceHolder.Color = Color3.fromRGB(79, 120, 237);
        PlaceHolder.Size = new Vector3(0.5, radius * 2, radius * 2);
        PlaceHolder.Orientation = new Vector3(0, 0, 90);
        PlaceHolder.Position = model.GetPivot().Position.sub(new Vector3(0, size.Y / 2, 0));
        PlaceHolder.TopSurface = Enum.SurfaceType.Smooth;
        PlaceHolder.BottomSurface = Enum.SurfaceType.Smooth;

        CollectionService.AddTag(PlaceHolder, 'PlaceHolder');

        return PlaceHolder;
    }

    private SetPlaceHolder() {
        if (!this.Tower || !this.model) return;
        this.DestroyPlaceHolder();

        // TODO
        const stats = 3;

        this.PlaceHolder = this.CreatePlaceHolder(stats, this.model);
    }

    private SetNeedColorForPlaceHolder(instance: Instance) {
        if (!this.PlaceHolder || !this.Tower || !this.model) return;

        const tag = this.Tower.Placing;
        const isHaveTag = CollectionService.HasTag(instance, tag);

        if (isHaveTag) {
            this.PlaceHolder.Color = this.ColorAllowsPlace;
            return;
        }

        this.PlaceHolder.Color = this.ColorBanPlace;
    }

    public EnablePreviewTower(tower: TowerConfig) {
        if (this.Tower) {   
            this.DisablePreviewTower(); 
        }   
        
        this.Tower = tower;
        this.model = tower.Levels[0].Model.Clone(); 
        this.model.Parent = Workspace;
        this.model.PrimaryPart!.Anchored = true;

        this.model.GetDescendants().forEach((instance) => {
            if (instance.IsA('BasePart')) {
                instance.CanCollide = false;
                instance.CollisionGroup = 'Tower';
            }
        })

        this.SetPlaceHolder();
        this.ShowRestrictedArea();
    }

    private mouseRaycast(): [RaycastResult?, Ray?] {
        const mousePosition = UserInputService.GetMouseLocation();
        const ray = camera.ViewportPointToRay(mousePosition.X, mousePosition.Y);
        const params = new RaycastParams();
        const blacklist: Instance[] = [];

        blacklist.push(this.model as Model, this.PlaceHolder as Part);
        
        CollectionService.GetTagged(Collision.Tower).forEach((value) => {
            blacklist.push(value);
        });

        CollectionService.GetTagged(Collision.Enemy).forEach((value) => {
            blacklist.push(value);
        });

        CollectionService.GetTagged(Collision.Player).forEach((value) => {
            blacklist.push(value);
        })

        params.FilterType = Enum.RaycastFilterType.Exclude;
        params.FilterDescendantsInstances = blacklist;

        return [Workspace.Raycast(ray.Origin, ray.Direction.mul(9999), params), ray];
    }

    onInit() {
        RunService.Stepped.Connect(() => {
            if (this.Tower && this.model && this.PlaceHolder) {
                const [result, ray] = this.mouseRaycast();
                if (result === undefined || result.Instance === undefined) { return; }

                const size = this.model.GetExtentsSize();
                this.model.PivotTo(new CFrame(result.Position.add(new Vector3(0, size.Y / 2, 0))));
                this.PlaceHolder.Position = result.Position;
                this.ray = ray

                this.SetNeedColorForPlaceHolder(result.Instance);
            }
        });

        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (input.UserInputType !== Enum.UserInputType.MouseButton1 || gameProcessed) return;
            if (!this.Tower || !this.model || !this.ray) return;

            const position = input.Position
            const guisAtPosition = PlayerGui.GetGuiObjectsAtPosition(position.X, position.Y);
            if (guisAtPosition.size() !== 0) return;

            Functions.PlaceTower(this.Tower!.Name, this.ray);
            this.DisablePreviewTower();
        });

        UserInputService.InputBegan.Connect((input) => {
            if (input.KeyCode !== Enum.KeyCode.Q) return;
            
            this.DisablePreviewTower();
        });
    }
}