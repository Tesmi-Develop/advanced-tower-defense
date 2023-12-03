import { Enemy } from "../Enemy";
import { AttackModule } from "./Modules/AttackModule";
import { Tower } from "./Tower";

export abstract class TowerAttackMode {
    private attackModule: AttackModule;
    private tower: Tower;

    constructor(attackModule: AttackModule, tower: Tower) {
        this.attackModule = attackModule;
        this.tower = tower;
    }

    public GetAttackModule() { return this.attackModule; }

    public GetTower() { return this.tower; }

    public abstract Invoke(enemies: Enemy[]): Enemy
}