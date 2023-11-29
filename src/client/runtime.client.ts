import { Flamework } from "@flamework/core";
import { Enemy } from "shared/Classes/Enemy";
import { Tower } from "shared/Classes/Tower";

if (!game.IsLoaded()) {
    game.Loaded.Wait();
}

if (!game.IsLoaded()) {
    warn("Intro error #1: Time exceeded for IsLoaded()")
}

Flamework.addPaths("src/client/components");
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/shared/components");

Flamework.addPaths('src/shared/Classes');

Tower.StaticInitTowerConfigs();
Enemy.StaticInitClient();

Flamework.ignite();
