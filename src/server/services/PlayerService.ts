import { Components } from "@flamework/components";
import { Service, OnStart, OnInit } from "@flamework/core";
import Signal from "@rbxts/rbx-better-signal";
import { Players } from "@rbxts/services";
import { PlayerComponent } from "server/components/PlayerComponent";
import { GameService } from "./GameService";
import { Functions } from "server/network";

@Service({})
export class PlayerService implements OnStart, OnInit {
    public readonly OnPlayerAdded = new Signal<(player: PlayerComponent) => void>();
    public readonly OnPlayerRemoved = new Signal<(player: PlayerComponent) => void>();
    constructor(private components: Components, private gameService: GameService) {}

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

    private initEvents() {
        Functions.Vote.setCallback((player, confirm) => {
            const waveHandler = this.gameService.GetWaveHandler();
            return waveHandler.OnVote(player, confirm);
        });
    }

    onStart() {
    }
}