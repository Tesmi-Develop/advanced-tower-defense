import { Dependency } from "@flamework/core";
import { PlayerReplica } from "Types/Data/Replica";
import { TowerConfig } from "Types/Tower/TowerConfig";
import { PlayerComponent } from "server/components/PlayerComponent";
import { GameService } from "server/services/GameService";
import { Tower } from "shared/Classes/Tower";
import { OnReplicaCreate, PlayerModuleDecorator } from "shared/decorators/PlayerModuleDecorator";

@PlayerModuleDecorator()
export class TowerInventory implements OnReplicaCreate {
    private content: (TowerConfig | undefined)[] = [];

    public GetContent() {
        return this.content; 
    }

    public GetTower(index: number) {
        return this.content[index];
    }

    public FindTower(towerName: string): TowerConfig | undefined {
        for (const tower of this.content) {
            if (!tower) continue;
            if (tower.Name === towerName) return tower;
        }

        return;
    }

    OnReplicaCreate(replica: PlayerReplica): void {
        const config = Dependency(GameService).GetConfig();

        for (const i of $range(1, config.CountTowerSlots)) {
            const towerName = replica.Data.Profile.Towers[i-1];
            if (!towerName) continue;

            const tower = Tower.GetTowerConfigByName(towerName);
            this.content[i - 1] = tower;
        }
    }
}