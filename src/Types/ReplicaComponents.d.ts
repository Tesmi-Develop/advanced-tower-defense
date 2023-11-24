import { IOre } from "./IOre";
import { PetCrateInfo } from "./PetCrate/PetCrateInfo";

declare global {
    interface ReplicaComponents {
        OreSpawnReplica: {
            MaxHealth: number;
            Health: number;
            Ores: IOre[];
        }
        PetCrateReplica: {
            PetsList: PetCrateInfo[],
            Price: number,
        }
    }
}

export type OreSpawnReplica = ReplicaComponents['OreSpawnReplica'];
export type PetCrateReplica = ReplicaComponents['PetCrateReplica'];