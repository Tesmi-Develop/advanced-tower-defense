import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import EasyTween from "@rbxts/easytween";
import { GlobalDataReplica } from "Types/Data/Replica";
import { OnGlobalReplicaCreated } from "client/controllers/PlayerController";

@Component({})
export class BaseHealthComponent extends BaseComponent<{}, PlayerGui['Main']['BaseHealthBar']> implements OnStart, OnGlobalReplicaCreated {
    private tween = new EasyTween(1, new TweenInfo(0.8));

    UpdateHealthBar(value: number, maxValue: number) {
        this.instance.Anount.Text = `${value}/${maxValue}`;
        
        this.tween.Set(value / maxValue);
    }
    onStart() {
        this.tween.ListenToChange((value) => {
            this.instance.Fill.Size = UDim2.fromScale(value, 1);
        });
    }

    OnGlobalReplicaCreated(replica: GlobalDataReplica): void {
        replica.ListenToChange('BaseHealth', () => {
            this.UpdateHealthBar(replica.Data.BaseHealth, replica.Data.BaseMaxHealth);
        });
        this.UpdateHealthBar(replica.Data.BaseHealth, replica.Data.BaseMaxHealth);
    }
}