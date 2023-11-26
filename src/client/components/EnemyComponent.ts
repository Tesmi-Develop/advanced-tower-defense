import { Component, BaseComponent } from "@flamework/components";
import { Enemy } from "shared/Classes/Enemy";

@Component({})
export class EnemyComponent extends BaseComponent<{}, Model> {
    private enemy!: Enemy;
    
    public GetEnemy() {
        return this.enemy;
    }

    public Init(enemy: Enemy) {
        this.enemy = enemy;
    }
}