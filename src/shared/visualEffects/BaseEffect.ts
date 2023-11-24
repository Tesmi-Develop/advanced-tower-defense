import { Players } from "@rbxts/services";
import { OnlyClient } from "shared/decorators/Methods/OnlyClient";
import { OnlyServer } from "shared/decorators/Methods/OnlyServer";
import { GlobalEvents } from "shared/network";

export interface BaseConfig {}

const DefaultRaduisVFX = 150;

export default abstract class BaseEffect<T extends BaseConfig = BaseConfig> {
    protected readonly name: string;
    protected readonly config: T;
    
    constructor(Config: T) {
        this.name = `${getmetatable(this)}`;
        this.config = Config;
    }

    @OnlyServer
    public Broadcast() {
        GlobalEvents.server.CastVFX.broadcast(this.name, this.config);
    }

    @OnlyServer
    public Fire(Player: Player | Player[]) {
        GlobalEvents.server.CastVFX.fire(Player, this.name, this.config);
    }

    @OnlyServer
    public Except(Player: Player | Player[]) {
        GlobalEvents.server.CastVFX.except(Player, this.name, this.config);
    }

    @OnlyServer
    public FireInRadius(point: Vector3, raduis = DefaultRaduisVFX) {
        Players.GetPlayers().forEach((player) => {
            const character = player.Character;
            if (!character) return;

            const delta = point.sub(character.GetPivot().Position);
            
            if (delta.Magnitude > raduis) return;

            this.Fire(player);
        })
    }

    protected abstract onCast(): void

    @OnlyClient
    public Cast() {
        this.onCast();
    }
}
