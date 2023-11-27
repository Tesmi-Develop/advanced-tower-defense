import { Component, BaseComponent } from "@flamework/components";
import { GlobalDataReplica } from "Types/Data/Replica";
import LocalPlayer from "client/LocalPlayer";
import { OnGlobalReplicaCreated } from "client/controllers/PlayerController";
import { Functions } from "client/network";

@Component({})
export class SkipWaveComponent extends BaseComponent<{}, PlayerGui['Main']['SkipWave']> implements OnGlobalReplicaCreated {
    private replica!: GlobalDataReplica;
    
    private onEnableVote() {
        this.instance.Visible = true;
        this.onUpdate();
    }

    private onUpdate() {
        const haveVote = this.replica.Data.Voted.includes(LocalPlayer);
        this.instance.Counter.Text = `${this.replica.Data.CountConfirm}/${this.replica.Data.NeedCountVoted}`;
        this.instance.Confirm.Visible = !haveVote;
        this.instance.Cancel.Visible = !haveVote;
    }

    OnGlobalReplicaCreated(replica: GlobalDataReplica): void {
        this.replica = replica;

        this.instance.Confirm.MouseButton1Click.Connect(() => {
            if (!this.replica.Data.IsEnableVote) return;
            Functions.Vote(true);
        });

        this.instance.Cancel.MouseButton1Click.Connect(() => {
            if (!this.replica.Data.IsEnableVote) return;
            Functions.Vote(false);
        });

        replica.ListenToChange('IsEnableVote', (value) => {
            if (value) {
                this.onEnableVote();
                return;
            }

            this.instance.Visible = false;
        });

        replica.ListenToChange('CountConfirm', (value) => {
            this.onUpdate();
        });

        replica.ListenToArrayInsert('Voted', () => {
            this.onUpdate();
        });

        if (replica.Data.IsEnableVote) {
            this.onEnableVote();
            return
        }

        this.instance.Visible = false;
    }
}