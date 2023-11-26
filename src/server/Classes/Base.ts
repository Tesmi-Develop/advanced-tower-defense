import { GlobalDataReplica } from "Types/Data/Replica";
import Damageable from "../../shared/Classes/Damageable";

export class Base extends Damageable {
    private replica!: GlobalDataReplica;

    constructor(replica: GlobalDataReplica) {
        super(replica.Data.BaseHealth);
        this.replica = replica;
    }

    protected Die(): void {
        print('Game over.');
    }

    public Init() {
        this.OnChangeHealth.Connect((health) => {
            this.replica.SetValue('BaseHealth', health);
        });
    }
}

