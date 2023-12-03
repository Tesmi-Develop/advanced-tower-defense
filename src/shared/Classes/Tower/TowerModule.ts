import Maid from "@rbxts/maid";
import { ITowerModuleConfig } from "Types/Tower/ITowerModuleConfig";
import { Tower } from "./Tower";
import { SharedClass } from "shared/SharedDecorators/SharedDecorators";
import { t } from "@rbxts/t"

@SharedClass({})
export class TowerModule<T extends ITowerModuleConfig = ITowerModuleConfig> {
    protected readonly config: T;
    protected readonly tower: Tower;
    protected readonly maid = new Maid();

    constructor(tower: Tower, config: T) {
        this.tower = tower;
        this.config = config;
    }

    protected destroy() { };

    protected getValidator(): t.check<any> {
        throw 'Must be overridden';
    };

    protected init() { };

    public Init() {
        assert(this.getValidator()(this.config), 'Config is not valid');
        this.init();
    };

    public Destroy() {
        this.maid.DoCleaning();
    }
}