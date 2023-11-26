import { Controller, Dependency, OnInit, OnStart } from "@flamework/core";
import { PlayerReplica } from "Types/Data/Replica";
import LocalPlayer from "client/LocalPlayer";
import { PlayerController } from "./PlayerController";
import { Components } from "@flamework/components";
import { BaseHealthComponent } from "client/components/UI/BaseHealthComponent";
import { EnemyInfoComponent } from "client/components/UI/EnemyInfoComponent";
import { WaveCounterComponent } from "client/components/UI/WaveCounterComponent";

const PlayerGui = LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

type PlayerGuiKeyOf =
    | 'CurrentScreenOrientation'
    | 'ScreenOrientation'
    | 'SelectionImageObject'
    | '_nominal_PlayerGui'
    | 'TopbarTransparencyChangedSignal'
    | 'SetTopbarTransparency'
    | 'GetTopbarTransparency'

export type PlayerGuiChildrens = Omit<Omit<PlayerGui, keyof BasePlayerGui & keyof StarterGui>, PlayerGuiKeyOf>

@Controller({})
export class GuiController implements OnStart, OnInit {
    private playerController: PlayerController;
    private tween?: Tween;

    constructor(playerController: PlayerController) {
        this.playerController = playerController;
    }

    onInit(): void | Promise<void> {
    }

    OnInitGui() {
        const Main = this.GetScreenGui('Main');
        const components = Dependency(Components);

        components.addComponent<BaseHealthComponent>(Main.BaseHealthBar);
        components.addComponent<EnemyInfoComponent>(this.GetScreenGui('HoverGui').Enemies);
        components.addComponent<WaveCounterComponent>(Main.WaveCounter);
    }

    public Fade(time: number) {
        /*const tweenInfo = new TweenInfo(time);

        if (this.tween) {
            this.tween.Cancel();
            this.tween.Destroy();
        }

        this.tween = TweenService.Create(PlayerGui.Fade.Frame, tweenInfo, {
            BackgroundTransparency: 0,
        });

        this.tween.Play();

        return this.tween;*/
    }

    public Lighten(time: number) {
        /*const tweenInfo = new TweenInfo(time);

        if (this.tween) {
            this.tween.Cancel();
            this.tween.Destroy();
        }

        this.tween = TweenService.Create(PlayerGui.Fade.Frame, tweenInfo, {
            BackgroundTransparency: 1,
        });

        this.tween.Play();

        return this.tween;*/
    }

    public EnableGui(name: keyof PlayerGuiChildrens) {
        const instance = PlayerGui.FindFirstChild(name) as ScreenGui;
        assert(instance, `Not found screenGui ${name}`);

        instance.Enabled = true;
    }

    public DisableGui(name: keyof PlayerGuiChildrens) {
        const instance = PlayerGui.FindFirstChild(name) as ScreenGui;
        assert(instance, `Not found screenGui ${name}`);

        instance.Enabled = false;
    }

    public GetScreenGui<T extends keyof PlayerGuiChildrens>(name: T): PlayerGui[T] {
        return PlayerGui.WaitForChild(name) as PlayerGui[T];
    }

    public onStart() {
        task.wait();

        PlayerGui.GetChildren().forEach((instance) => {
            if (!instance.IsA('ScreenGui')) return;

            instance.ResetOnSpawn = false;
        });

        this.OnInitGui();
        this.EnableGui('Main');
    }
}