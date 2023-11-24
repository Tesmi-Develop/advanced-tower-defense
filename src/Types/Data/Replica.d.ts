import { Replica } from "@rbxts/replicaservice";
import { DynamicData } from "./DynamicData";
import { ProfileData } from "./ProfileData";
import PlayerData from "shared/WriteLibs/PlayerData";
import Trade from "shared/WriteLibs/Trade";
import { PlayerTradeData } from "Types/PlayerTradeData";

declare global {
	interface Replicas {
		PlayerData: {
			Data: {
				Profile: ProfileData;
				Dynamic: DynamicData;
			};
			Tags: {};
			WriteLib: typeof PlayerData
		}
		TradeReplica: {
			Data: {
				Owner: PlayerTradeData;
				Opponent: PlayerTradeData;
				EndTime?: number;
			}
			Tags: {};
			WriteLib: typeof Trade;
		}
	}
}

export type PlayerReplica = Replica<"PlayerData">;
export type TradeReplica = Replica<"TradeReplica">;

export type PlayerTradeRoles = NonNullable<ExtractKeys<Replicas['TradeReplica']['Data'], PlayerTradeData>>;