import { Component, BaseComponent } from "@flamework/components";
import { OnGlobalReplicaCreated } from "client/controllers/PlayerController";
import { GlobalDataReplica } from "Types/Data/Replica";

@Component({})
export class WaveCounterComponent extends BaseComponent<{}, PlayerGui['Main']['WaveCounter']> implements OnGlobalReplicaCreated {

    OnGlobalReplicaCreated(replica: GlobalDataReplica): void {
        replica.ListenToChange('Wave', (wave) => {
            this.instance.Text = `Wave ${wave}`;
        });

        this.instance.Text = `Wave ${replica.Data.Wave}`;
    }
    
}