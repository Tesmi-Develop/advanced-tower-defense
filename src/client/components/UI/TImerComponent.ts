import { Component, BaseComponent } from "@flamework/components";
import { GlobalDataReplica } from "Types/Data/Replica";
import { OnGlobalReplicaCreated } from "client/controllers/PlayerController";
import ToHMS from "shared/Utility/ToHMS";
import { GetCurrentTime } from "shared/Utility/Utility";
import { Spawn } from "shared/decorators/Methods/Spawn";

@Component({})
export class TimerComponent extends BaseComponent<{}, PlayerGui['Main']['Timer']> implements OnGlobalReplicaCreated {
    private replica!: GlobalDataReplica;
    @Spawn
    private initTimer() {
        while(true) {
            task.wait();
            const delta = this.replica.Data.EndTime - GetCurrentTime();
            if (delta <= 0) {
                this.instance.Text = ToHMS(0);
                continue;
            }

            this.instance.Text = ToHMS(delta);
        }
    }
    OnGlobalReplicaCreated(replica: GlobalDataReplica): void {
        this.replica = replica;
        this.initTimer();
    }
}