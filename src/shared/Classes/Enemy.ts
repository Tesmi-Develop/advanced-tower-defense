import EasyTween from "@rbxts/easytween";
import { RunService, Workspace } from "@rbxts/services";
import { Spawn } from "../decorators/Methods/Spawn";
import { IsNaN } from "../Utility/Utility";
import BezierCurve from "@rbxts/bezier";
import { ClientMethod, NonSyncProperty, SharedClass, SharedMethod } from "shared/SharedDecorators/SharedDecorators";
import { OnlyClient } from "shared/decorators/Methods/OnlyClient";
import Collision from "shared/Collisions";
import Damageable from "./Damageable";
import { Dependency } from "@flamework/core";
import type { GameService } from "server/services/GameService";
import type { EnemyComponent } from "client/components/EnemyComponent";
import Maid from "@rbxts/maid";
import { Components } from "@flamework/components";

interface IEnemyConfig {
    Name: string;
    Health: number;
    Model: Model;
    WalkAnimation: Animation;
    Walkspeed: number;
}

const TEST_NODES = Workspace.FindFirstChild('Map')!.FindFirstChild('Path')!;
type Returned<T> = T extends Animation ? AnimationTrack : undefined

const createPart = (point: Vector3) => {
	const part = new Instance('Part', Workspace)
	part.Size = new Vector3(0.1, 0.1, 0.1)
	part.Anchored = true
	part.Position = point

	return part
}

@SharedClass()
export class Enemy extends Damageable {
    private config: IEnemyConfig;
    private moveVelocity = new Vector3(0, 0, 0);

    @NonSyncProperty()
    private movingCancel?: Callback;
    
    private enemyComponent!: EnemyComponent; 

    private nodes: Vector3[] = [];
    private position = new Vector3(0, 0, 0);
    private rotation = 0;
    private nodeIndex = 0;
    private lookCFrame = new CFrame();
    private lookVector = new Vector3(0, 0, 0);
    private model!: Model;
    private currentAnimation?: Animation;
    private aniamtionController!: AnimationController;

    private maid = new Maid();
    private loadedAnimations = new Map<Animation, AnimationTrack>();

    constructor(config: IEnemyConfig) {
        super(config.Health);
        this.config = config;
        this.initNodes();
    }

    public GetConfig() {
        return this.config;
    }

    private visualizeEnemy() {
        const EnemyPart = new Instance('Part', Workspace);
        EnemyPart.Anchored = true;
        EnemyPart.CanCollide = false;
        EnemyPart.CanQuery = false;
        EnemyPart.CanTouch = false;
        EnemyPart.Size = new Vector3(1, 3, 2);
        EnemyPart.PivotOffset = new CFrame(new Vector3(0, -EnemyPart.Size.Y / 2, 0));

        RunService.Heartbeat.Connect(() => {
            EnemyPart.PivotTo(new CFrame(this.position).mul(CFrame.Angles(0, math.rad(this.rotation), 0)));
        });
    }

    public PlayAnimation(animation: Animation, speed?: number) {
        let track = this.loadedAnimations.get(animation);

        if (!track) {
            const animator = this.aniamtionController.FindFirstChildOfClass('Animator') || new Instance('Animator', this.aniamtionController);

            track = animator.LoadAnimation(animation);
            this.loadedAnimations.set(animation, track);
        }

        if (track.IsPlaying) return track;
        track.Play();
        track.AdjustSpeed(speed);

        return track;
    }

    public ChangeAnimation<T extends Animation | undefined>(animation?: T, speed?: number): Returned<T> {
        const oldAnimation = this.currentAnimation;
        this.currentAnimation = animation;

        if (oldAnimation) {
            this.StopAnimation(oldAnimation);
        }

        if (this.currentAnimation) {
            return this.PlayAnimation(this.currentAnimation, speed) as Returned<T>;
        }

        return undefined as Returned<T>;
    }

    public StopAnimation(animation: Animation) {
        const track = this.loadedAnimations.get(animation);
        if (!track) return;

        track.Stop();
    }

    private initCollision() {
        this.model.GetDescendants().forEach((instance) => {
            if (!instance.IsA('BasePart')) return;

            instance.CollisionGroup = Collision.Enemy;
        });
    }

    private initModel() {
        this.model = this.config.Model.Clone();
        this.model.Parent = Workspace;

        this.aniamtionController = this.model.FindFirstChildOfClass('AnimationController') || new Instance('AnimationController', this.model);

        this.initCollision();

        this.maid.GiveTask(RunService.Heartbeat.Connect(() => {
            this.model.MoveTo(this.position);
            this.model.PivotTo(new CFrame(this.model.GetPivot().Position).mul(CFrame.Angles(0, math.rad(this.rotation), 0)))
        }));
    }

    @ClientMethod()
    private syncPositionAndOrientation(position: Vector3, rotation: number) {
        this.position = position;
        this.setRotation(rotation);
    }

    @OnlyClient
    private moveToClient() {
        this.ChangeAnimation(this.config.WalkAnimation);
    }

    @SharedMethod()
    private moveTo(index: number) {
        if (this.movingCancel) this.movingCancel();

        if (RunService.IsClient()) {
            this.moveToClient();
        }

        const thread = coroutine.running();
        const node = this.nodes[index];
        let distance = node.sub(this.position).Magnitude;
        const [x, y, z] = CFrame.lookAt(this.position, node).ToOrientation();

        if (!IsNaN(y) && math.deg(y) !== this.rotation) {
            const centre1 = new Vector3(node.X, this.position.Y, this.position.Z);
            const centre2 = new Vector3(this.position.X, this.position.Y, node.Z);
            let centre = centre1;

            const roundedRotation = (math.round(this.rotation));

            if ((roundedRotation < 45 && roundedRotation >= 0) || math.round(this.rotation) === -180) {
                centre = centre2;
            }

            const tween = new EasyTween(this.position, new TweenInfo(distance / this.config.Walkspeed, Enum.EasingStyle.Linear));
            const tweenRotation = new EasyTween(this.lookCFrame, new TweenInfo(distance / this.config.Walkspeed, Enum.EasingStyle.Linear));
            const curve = new BezierCurve([
                this.position,
                centre,
                node,
            ]);

            tween.ListenToChange((point) => {
                this.position = point;
            });

            tweenRotation.ListenToChange((cframe) => {
                this.setRotation(cframe);
            });

            const connection = tween.ListenToReacheGoal(() => {
                coroutine.resume(thread);
            });

            this.movingCancel = () => {
                pcall(() => task.cancel(thread));
                connection.Disconnect();
                tweenRotation.Destroy();
                tween.Destroy();
            }

            for(const i of $range(0, 1, 0.1)) {
                const point = curve.calculate(i);
                distance = this.position.sub(point).Magnitude;
                const tweenInfo = new TweenInfo(distance / this.config.Walkspeed, Enum.EasingStyle.Linear);

                tween.Set(point, tweenInfo);
                
                if (this.position !== point) {
                    tweenRotation.Set(CFrame.lookAt(this.position, point), tweenInfo);
                }
                
                coroutine.yield();
            }

            connection.Disconnect();
            tweenRotation.Destroy();
            tween.Destroy();
            this.syncPositionAndOrientation(this.position, this.rotation);
            this.movingCancel = undefined;

            return;
        }
        
        const tween = new EasyTween(this.position, new TweenInfo(distance / this.config.Walkspeed, Enum.EasingStyle.Linear));

        this.movingCancel = () => {
            pcall(() => task.cancel(thread));
            tween.Destroy();
        }

        tween.ListenToChange((point) => {
            this.position = point;
        });

        tween.ListenToReacheGoal(() => {
            coroutine.resume(thread);
            tween.Destroy();
        })

        tween.Set(node);

        coroutine.yield();
        this.movingCancel = undefined;
        this.syncPositionAndOrientation(this.position, this.rotation);
    }

    private setRotation(rotation: number | CFrame) {
        if (typeIs(rotation, 'number')) {
            const rotationInRad = math.rad(rotation);

            this.rotation = rotation;
            this.lookCFrame = CFrame.Angles(0, rotationInRad, 0);
            this.lookVector = this.lookCFrame.LookVector;
            return;
        }

        this.lookCFrame = rotation;
        this.lookVector = rotation.LookVector;
        const [x, y, z] = rotation.ToOrientation();
        this.rotation = math.deg(y);
    }

    private validateNode(index: number, node?: Instance) {
        assert(node, `Node${index} not found`);
        assert(node.IsA('BasePart'), `Node${node} is not a BasePart`);

        return true;
    }

    private initNodes() {
        const countNodes = TEST_NODES.GetChildren().size();

        for (let i = 0; i < countNodes; i++) {
            const node = TEST_NODES.FindFirstChild(`${i + 1}`) as BasePart;
            this.validateNode(i + 1, node);

            node.Transparency = 1;
            this.nodes.push(node.Position.sub(new Vector3(0, node.Size.Y / 2, 0)));
        }
    }

    @Spawn
    private initMoving() {
        this.position = this.nodes[0];
        const nextNode = this.nodes[1];
        if (!nextNode) return;
        
        this.setRotation(CFrame.lookAt(this.position, nextNode));
        this.nodes.forEach((point, index) => {
            this.nodeIndex = index;
            this.moveTo(index);
        });

        this.damageBase();
    }

    private initHeartbeat() {
        RunService.Heartbeat.Connect((dt) => {
            const nextPosition = this.position.add(this.moveVelocity.mul(dt));
            this.position = nextPosition;
        });
    }

    public Destroy() {
        if (RunService.IsClient()) {
            this.movingCancel?.();
            this.model.Destroy();
        }
        this.maid.DoCleaning();
    }

    private damageBase() {
        const gameService = Dependency<GameService>();
        gameService.GetBase().TakeDamage(this.GetHealth());
        this.TakeDamage(this.GetHealth());
    }

    protected Die() {
        this.Destroy();
    }

    private initComponent() {
        const components = Dependency<Components>();
        this.enemyComponent = components.addComponent<EnemyComponent>(this.model);
        this.enemyComponent.Init(this);
        this.maid.GiveTask(() => this.enemyComponent.destroy());
    }

    @Spawn
    public Init() {
        this.initHeartbeat();
        this.initMoving();
    }

    public InitClient() {
        this.initModel();
        this.initComponent();
        this.moveTo(this.nodeIndex);
    }
}
