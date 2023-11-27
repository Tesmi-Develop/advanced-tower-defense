import { Flamework } from "@flamework/core";
import { Enemy } from "shared/Classes/Enemy";

Flamework.addPaths("src/client/components");
Flamework.addPaths("src/client/controllers");
Flamework.addPaths("src/shared/components");

Flamework.addPaths('src/shared/Classes');

Enemy.StaticInitClient();

Flamework.ignite();
