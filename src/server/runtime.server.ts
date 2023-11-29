import { Flamework } from "@flamework/core";
import { Tower } from "shared/Classes/Tower";

Flamework.addPaths("src/server/components");
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/shared/components");

Flamework.addPaths("src/server/Classes");
Flamework.addPaths('src/shared/Classes');

Tower.StaticInitTowerConfigs();

Flamework.ignite();
