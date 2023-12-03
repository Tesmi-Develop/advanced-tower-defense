import { Components } from "@flamework/components";
import { Service, OnStart, OnInit } from "@flamework/core";
import Signal from "@rbxts/rbx-better-signal";
import { CollectionService, Players, Workspace } from "@rbxts/services";
import { PlayerComponent } from "server/components/PlayerComponent";
import { GameService } from "./GameService";
import { Functions } from "server/network";
import Collision from "shared/Collisions";
import { Tower } from "shared/Classes/Tower/Tower";

@Service({})
export class PlayerService implements OnStart, OnInit {
    public readonly OnPlayerAdded = new Signal<(player: PlayerComponent) => void>();
    public readonly OnPlayerRemoved = new Signal<(player: PlayerComponent) => void>();
    constructor(private components: Components, private gameService: GameService) { }

    onInit() {
        Players.PlayerAdded.Connect((player) => {
            const component = this.components.addComponent<PlayerComponent>(player);
            this.OnPlayerAdded.Fire(component);
        });

        Players.PlayerRemoving.Connect((player) => {
            const component = this.components.getComponent<PlayerComponent>(player);
            if (component === undefined) return;

            component.OnLeft();
            this.OnPlayerRemoved.Fire(component);
        });
        this.initEvents();
    }

    private generateRaycastFilter() {
        const blacklist: Instance[] = [];

        CollectionService.GetTagged(Collision.Tower).forEach((value) => {
            blacklist.push(value);
        });

        CollectionService.GetTagged(Collision.Enemy).forEach((value) => {
            blacklist.push(value);
        });

        CollectionService.GetTagged(Collision.Player).forEach((value) => {
            blacklist.push(value);
        });

        return blacklist;
    }

    private initEvents() {
        Functions.Vote.setCallback((player, confirm) => {
            const waveHandler = this.gameService.GetWaveHandler();
            return waveHandler.OnVote(player, confirm);
        });

        Functions.PlaceTower.setCallback((player, towerName, ray) => {
            const gameComponent = this.components.getComponent<PlayerComponent>(player)!;
            const tower = gameComponent.GetInventory().FindTower(towerName);
            if (!tower) return false;

            const blacklist = this.generateRaycastFilter();
            const raycastParams = new RaycastParams();
            raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
            raycastParams.FilterDescendantsInstances = blacklist;

            const raycastResut = Workspace.Raycast(ray.Origin, ray.Direction.mul(500), raycastParams);
            if (!raycastResut || !raycastResut.Instance) return false;

            const tag = tower.Placing;
            const isHaveTag = raycastResut.Instance.HasTag(tag);
            if (!isHaveTag) return false;

            const amount = tower.Levels[0].Price;
            if (!gameComponent.HasMoney(amount)) return false;

            gameComponent.TakeMoney(amount);
            new Tower(player, raycastResut.Position, tower).Init();

            return true;
        })
    }

    onStart() {
    }
}