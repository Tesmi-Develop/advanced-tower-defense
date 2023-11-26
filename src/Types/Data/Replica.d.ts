import { Replica } from "@rbxts/replicaservice";

declare global {
	interface Replicas {
		PlayerData: {
			Data: {
				Profile: ProfileData;
				Dynamic: DynamicData;
			};
			Tags: {};
		}
		GlobalData: {
			Data: {
				BaseHealth: number;
				BaseMaxHealth: number;
				Wave: number;
				Config: IGameConfig;
			}
			Tags: {};
		}
	}
}

export type PlayerReplica = Replica<"PlayerData">;
export type GlobalDataReplica = Replica<"GlobalData">;