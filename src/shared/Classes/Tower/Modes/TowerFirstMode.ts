import { Enemy } from "shared/Classes/Enemy";
import { TowerAttackMode } from "../TowerAttackMode";
import { TowerModeDecorator } from "shared/decorators/TowerModeDecorator";

@TowerModeDecorator
export class TowerFirstMode extends TowerAttackMode {
    public Invoke(enemies: Enemy[]): Enemy {
        let bestWaypointIndex = 0;
        let bestWaypointDistance = math.huge;
        let target: Enemy | undefined = undefined;

        enemies.forEach((enemy) => {
            const enemyPosition = enemy.GetPosition();
            const waypoint = enemy.GetNode();
            const distance = new Vector3(enemyPosition.X, 0, enemyPosition.Z).sub(new Vector3(waypoint.X, 0, waypoint.Z)).Magnitude;  
            const waypointIndex = enemy.GetNodeindex();

            if (target === undefined || waypointIndex >= bestWaypointIndex) {
                bestWaypointIndex = waypointIndex;

                if (distance < bestWaypointDistance) {
                    bestWaypointDistance = distance;
                    target = enemy;
                }
            }
        });

        return target!;
    }
}