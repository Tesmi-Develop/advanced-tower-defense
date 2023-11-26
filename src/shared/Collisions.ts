import { PhysicsService, RunService } from "@rbxts/services";

enum Collision {
    Enemy = 'Enemy',
    Player = 'Player',
}

if (RunService.IsServer()) {
    PhysicsService.RegisterCollisionGroup(Collision.Player);
    PhysicsService.CollisionGroupSetCollidable(Collision.Player, Collision.Player, false);

    PhysicsService.RegisterCollisionGroup(Collision.Enemy);
    PhysicsService.CollisionGroupSetCollidable(Collision.Enemy, Collision.Enemy, false);
    PhysicsService.CollisionGroupSetCollidable(Collision.Enemy, Collision.Player, false);
}

export default Collision;