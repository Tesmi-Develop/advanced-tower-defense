import EasyTween from "@rbxts/easytween";
import { RunService, Workspace } from "@rbxts/services";
import { Spawn } from "./decorators/Methods/Spawn";
import { IsNaN } from "./Utility/Utility";
import BezierCurve from "@rbxts/bezier";

interface IEnemyConfig {
    Walkspeed: number;
}

const TEST_NODES = Workspace.FindFirstChild('Map')!.FindFirstChild('Path')!;

const createPart = (point: Vector3) => {
	const part = new Instance('Part', Workspace)
	part.Size = new Vector3(0.1, 0.1, 0.1)
	part.Anchored = true
	part.Position = point

	return part
}

export class Enemy {
    private config: IEnemyConfig;
    private nodes: Vector3[] = [];
    private moveVelocity = new Vector3(0, 0, 0);
    private position = new Vector3(0, 0, 0);
    private rotation = 0;
    private lookCFrame = new CFrame();
    private lookVector = new Vector3(0, 0, 0);

    constructor(config: IEnemyConfig) {
        this.config = config;
    }

    @Spawn
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

    private moveTo(index: number) {
        const thread = coroutine.running();
        const node = this.nodes[index];
        let distance = node.sub(this.position).Magnitude;
        const [x, y, z] = CFrame.lookAt(this.position, node).ToOrientation();

        if (!IsNaN(y) && math.deg(y) !== this.rotation) {
            const centre1 = new Vector3(node.X, this.position.Y, this.position.Z);
            const centre2 = new Vector3(this.position.X, this.position.Y, node.Z);
            let centre = centre1;

            print(math.round(this.rotation) === 0, math.round(this.rotation), 0)
            if (math.round(this.rotation) === 0 || math.round(this.rotation) === -180) {
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
            })

            for(const i of $range(0, 1, 0.01)) {
                const point = curve.calculate(i);
                createPart(point);
            }

            const connection = tween.ListenToReacheGoal(() => {
                coroutine.resume(thread);
            });

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
            return;
        }
        
        const tween = new EasyTween(this.position, new TweenInfo(distance / this.config.Walkspeed, Enum.EasingStyle.Linear));

        tween.ListenToChange((point) => {
            this.position = point;
        });

        tween.ListenToReacheGoal(() => {
            coroutine.resume(thread);
            tween.Destroy();
        })

        tween.Set(node);

        coroutine.yield();
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
            print(`Moving to node ${index + 1}`, point);
            this.moveTo(index);
        });
    }

    private initHeartbeat() {
        RunService.Heartbeat.Connect((dt) => {
            const nextPosition = this.position.add(this.moveVelocity.mul(dt));
            this.position = nextPosition;
        });
    }

    @Spawn
    public Init() {
        this.initNodes();
        this.initHeartbeat();
        this.initMoving();
        this.visualizeEnemy();
    }
}
