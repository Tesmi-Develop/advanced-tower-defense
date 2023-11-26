import { OnStart } from "@flamework/core";
import { Component, BaseComponent, Components } from "@flamework/components";
import { CollectionService, RunService, UserInputService, Workspace } from "@rbxts/services";
import LocalPlayer from "client/LocalPlayer";
import { Enemy } from "shared/Classes/Enemy";
import { FindFirstAncestorOfClassWithPredict } from "shared/Utility/Utility";
import { EnemyComponent } from "../EnemyComponent";

const camera = Workspace.CurrentCamera;

@Component({})
export class EnemyInfoComponent extends BaseComponent<{}, PlayerGui['HoverGui']['Enemies']> implements OnStart {

    constructor(private components: Components) {
        super();
    }

    onStart() {
        RunService.RenderStepped.Connect(() => {
            this.instance.Visible = false;

            const mousePosition = UserInputService.GetMouseLocation();
            const ray = camera?.ViewportPointToRay(mousePosition.X, mousePosition.Y);
            if (!ray) return;

            const params = new RaycastParams();
            params.FilterType = Enum.RaycastFilterType.Exclude;
            params.FilterDescendantsInstances = LocalPlayer.Character ? CollectionService.GetTagged("Character") : [];

            const raycastResult = Workspace.Raycast(ray.Origin, ray.Direction.mul(999), params);

            if (raycastResult?.Instance === undefined || raycastResult.Instance.Parent === undefined) return;

            const needModel = FindFirstAncestorOfClassWithPredict(raycastResult.Instance, 'Model', (model) => {
                return this.components.getComponent<EnemyComponent>(model) !== undefined;
            });

            if (!needModel) return;

            const component = this.components.getComponent<EnemyComponent>(needModel)!;

            this.instance.Position = UDim2.fromOffset(mousePosition.X + 5, mousePosition.Y);

            this.UpdateInfo(component.GetEnemy());
        })
    }
    UpdateInfo(enemy: Enemy) {
        this.instance.Visible = true;

        this.instance.Title.TextLabel.Text = enemy.GetConfig().Name;
        this.instance.Health.Bar.Size = UDim2.fromScale(enemy.GetHealth() / enemy.GetMaxHealth(), 1);
        this.instance.Health.Count.Text = `${enemy.GetHealth()} / ${enemy.GetMaxHealth()}`;
    }
}