import { Component, BaseComponent } from "@flamework/components";
import { PlacingTower } from "client/controllers/PlacingTower";
import { OnReplicaCreated, PlayerController } from "client/controllers/PlayerController";
import { Tower } from "shared/Classes/Tower";
import { PlayerReplica } from "Types/Data/Replica";
import { TowerConfig } from "Types/Tower/TowerConfig";

const keycodeIndex = new Map<Enum.KeyCode, number>()
	.set(Enum.KeyCode.One, 1)
	.set(Enum.KeyCode.Two, 2)
	.set(Enum.KeyCode.Three, 3)
	.set(Enum.KeyCode.Four, 4)
	.set(Enum.KeyCode.Five, 5)
	.set(Enum.KeyCode.Six, 6)
	.set(Enum.KeyCode.Seven, 7)
	.set(Enum.KeyCode.Eight, 8)
	.set(Enum.KeyCode.Nine, 9);

@Component({})
export class TowerListComponent extends BaseComponent<{}, PlayerGui['Main']['Towers']> implements OnReplicaCreated {
    private template = this.instance.Tower;
    private towers = new Map<typeof this.instance.Tower, TowerConfig | undefined>();

    constructor(private playerController: PlayerController, private placingTower: PlacingTower) {
        super();
    }

    private createCell(towerName?: string) {
        const tower = towerName ? Tower.GetTowerConfigByName(towerName) : undefined;
        const cell = this.template.Clone();
        cell.Visible = true;
        cell.Parent = this.instance.List;
        cell.Image = `rbxassetid://${tower?.Logo}` ?? 'rbxassetid://0';

        cell.MouseButton1Click.Connect(() => {
            if (!tower) return;
            this.placingTower.EnablePreviewTower(tower);
        });

        this.towers.set(cell, tower);
    }

    onReplicaCreated(replica: PlayerReplica): void {
        const globalReplica = this.playerController.GetGlobalReplicaAsync();
        for (const i of $range(1, globalReplica.Data.Config.CountTowerSlots)) {
            this.createCell(replica.Data.Profile.Towers[i - 1]);
        }
    }
}