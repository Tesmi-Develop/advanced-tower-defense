import { ITowerModuleConfig } from "Types/Tower/ITowerModuleConfig";
import { Enemy } from "../../Enemy";
import { TowerModule } from "../TowerModule";
import Signal from "@rbxts/rbx-better-signal";
import { RunService } from "@rbxts/services";
import { SharedMethod } from "shared/SharedDecorators/SharedDecorators";
import { TowerAttackMode } from "../TowerAttackMode";
import { Tower } from "../Tower";
import { TowerFirstMode } from "../Modes/TowerFirstMode";
import { TowerModes } from "shared/decorators/TowerModeDecorator";
import { Flamework } from "@flamework/core";

interface AttackModuleConfig extends ITowerModuleConfig {
    Damage: number;
    Range: number;
    Cooldown: number;
}

const checker = Flamework.createGuard<AttackModuleConfig>();

export abstract class AttackModule extends TowerModule<AttackModuleConfig> {
    private mode: TowerAttackMode;
    private onFinishCooldown = new Signal<() => void>();
    private time = 0;
    private target = undefined as Enemy | undefined;
    private waitingTarget?: Signal;

    constructor(tower: Tower, config: AttackModuleConfig) {
        super(tower, config);
        this.mode = new TowerFirstMode(this, this.tower);
    }

    @SharedMethod()
    public ChangeMode(mode: string): void {
        const modeConstructor = TowerModes.get(mode);
        if (!modeConstructor) return;

        this.mode = new modeConstructor(this as never, this.tower as never);
    }

    protected getValidator() {
        return checker;
    }

    private getEnemiesInRange() {
        const enemiesInRange: Enemy[] = [];

        Enemy.Enemies.forEach((enemy) => {
            const distance = this.tower.GetPosition().sub(enemy.GetPosition()).Magnitude;

            if (enemy.GetHealth() <= 0) return;
            if (distance > this.config.Range) return;

            enemiesInRange.push(enemy);
        });

        return enemiesInRange;
    }

    private updateTargetWithCurrentMode() {
        const oldTarget = this.target;
        this.target = this.mode.Invoke(this.getEnemiesInRange());

        if (!oldTarget && this.target) {
            this.waitingTarget?.Fire();
        }
    }

    private setCooldown() {
        const lastTime = this.time;
        this.time = this.config.Cooldown;

        if (lastTime > 0) return;

        this.maid.GiveTask(task.spawn(() => {
            while (true) {
                if (this.time <= 0) break;

                this.time -= task.wait(0.1);
            }

            this.onFinishCooldown.Fire();
        }));
    }

    private waitForTarget() {
        if (!this.target) {
            if (!this.waitingTarget) {
                this.waitingTarget = new Signal();
            }

            this.waitingTarget.Wait();
        }
    }

    private preAttack(): void {
        this.waitForTarget();

        this.aimToTarget();
        this.Attack(this.target!, this.config.Damage);
        this.setCooldown();
    }

    public abstract Attack(target: Enemy, damage: number): void

    private aimToTarget() {
        if (this.target === undefined) return;

        const targetPosition = this.target.GetPosition();
        const towerPosition = this.tower.GetPosition();
        this.tower.SetRotation(CFrame.lookAt(new Vector3(towerPosition.X, 0, towerPosition.Z), new Vector3(targetPosition.X, 0, targetPosition.Z)));
    }

    private initEvents() {
        this.maid.GiveTask(this.onFinishCooldown.Connect(() => {
            this.preAttack();
        }));

        this.maid.GiveTask(RunService.Heartbeat.Connect(() => {
            this.updateTargetWithCurrentMode();
        }));
    }

    protected init() {
        this.initEvents();
        this.setCooldown();
    }
}