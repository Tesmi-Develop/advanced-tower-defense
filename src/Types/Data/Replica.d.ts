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
				EndTime: number;
				BaseHealth: number;
				BaseMaxHealth: number;
				Wave: number;
				IsEnableVote: boolean;
				NeedCountVoted: number;
				CountConfirm: number;
				Voted: Player[];
				Config: IGameConfig;
			}
			Tags: {};
		}
	}
}

export type PlayerReplica = Replica<"PlayerData">;
export type GlobalDataReplica = Replica<"GlobalData">;