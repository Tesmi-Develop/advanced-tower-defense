import { Components } from "@flamework/components";
import { Service, OnStart, OnInit } from "@flamework/core";
import Signal from "@rbxts/rbx-better-signal";
import { Players } from "@rbxts/services";
import { PlayerComponent } from "server/components/PlayerComponent";

@Service({})
export class PlayerService implements OnStart, OnInit {
    public readonly OnPlayerAdded = new Signal<(player: PlayerComponent) => void>();
    public readonly OnPlayerRemoved = new Signal<(player: PlayerComponent) => void>();
    constructor(private components: Components) {}

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
    }

    onStart() {
        
    }
}