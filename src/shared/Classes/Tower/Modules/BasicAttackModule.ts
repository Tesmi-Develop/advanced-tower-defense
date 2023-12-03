import { TowerModuleDecorator } from "shared/decorators/TowerModuleDecorator";
import { AttackModule } from "./AttackModule";
import { Enemy } from "shared/Classes/Enemy";

@TowerModuleDecorator
export class BasicAttackModule extends AttackModule {
    public Attack(target: Enemy, damage: number): void {
        target.TakeDamage(damage);
        print('basic attack');
    }
}