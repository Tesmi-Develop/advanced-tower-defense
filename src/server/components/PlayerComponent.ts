import { Flamework, Modding, OnStart, Reflect } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { ReplicaService } from "@rbxts/replicaservice";
import { Profile } from "@rbxts/profileservice/globals";
import { Constructor } from "@rbxts/component";
import Signal from "@rbxts/rbx-better-signal";
import { ReplicatedStorage } from "@rbxts/services";
import DeepTableClone from "shared/Utility/DeepTableClone";
import { ProfileMetadata } from "Types/Data/ProfileMetadata";
import { PlayerReplica } from "Types/Data/Replica";
import { Spawn } from "shared/decorators/Methods/Spawn";
import { OnDataCreate, OnReplicaCreate, PlayerModuleDecorator } from "shared/decorators/PlayerModuleDecorator";
import { LoadProfile } from "server/DataStore/LoadProfile";
import Statistics from "shared/Config/Statistics";
import { TemplateDynamicData } from "server/DataStore/Templates";

const replicaPlayerDataToken = ReplicaService.NewClassToken("PlayerData");

@Component({})
export class PlayerComponent extends BaseComponent<{}, Player> implements OnStart {
	public readonly OnChangedStatistics = new Signal<(name: keyof ProfileData['Statistics'], value: number) => void>();
	public readonly OnLeaved = new Signal<() => void>();
	private profile!: Profile<ProfileData, ProfileMetadata>;
	private replica!: PlayerReplica;
	private modules = new Map<string, object>();
	private orderedModules: ([object, number])[] = [];
	private waitingReplicaCreate?: Signal;

	private originalWalkspeed = 16;
	private currentWalkspeed = this.originalWalkspeed;
	private tracks = new Map<Animation, AnimationTrack>;
	public IsLoockUseSkill = false;

	public onStart() {
		const dynamicData = DeepTableClone(TemplateDynamicData);
		// Initilize all modules
		this.initModules();

		// Loading Profile
		this.initProfile();
		
		// Invoke onDataCreate
		this.orderedModules.forEach(([module]) => {
			if (!Flamework.implements<OnDataCreate>(module)) return;

			const [success, output] = pcall(() => module.OnDataCreate(this.profile.Data, dynamicData));
			
			if (!success) {
				warn(`[PlayerComponent: ${this.instance.Name}] ${output}`);
			}
		});

		// Initilize Replica
		this.initReplica(dynamicData);

		// Invoke onReplicaCreate
		this.orderedModules.forEach(([module]) => {
			if (!Flamework.implements<OnReplicaCreate>(module)) return;

			const [success, output] = pcall(() => module.OnReplicaCreate(this.replica));
			
			if (!success) {
				warn(`[PlayerComponent: ${this.instance.Name}] ${output}`);
			}
		});

		this.initCollision();
		this.initWalkspeed();
		this.initTag();

		this.instance.CharacterAdded.Connect(() => {
            this.tracks.clear();
        });
	}

	@Spawn
	private initWalkspeed() {
		const character = this.instance.Character || this.instance.CharacterAdded.Wait()[0];
		const humanoid = character.WaitForChild('Humanoid') as Humanoid;

		humanoid.WalkSpeed = this.currentWalkspeed;
	}

	@Spawn
	private initTag() {
		const character = this.instance.Character || this.instance.CharacterAdded.Wait()[0];
		character.AddTag("Character");
		character.AddTag("Player");

		this.instance.CharacterAdded.Connect((character) => {
			character.AddTag("Character");
			character.AddTag("Player");
		});
	}

	public IsAliveCharacter() {
		const character = this.instance.Character;
		if (character === undefined) return false;

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid === undefined ) return false;

		return humanoid.Health > 0;
	}

	public GetModule<T extends object>(moduleConstructor: Constructor<T>): T {
		const module = this.modules.get(`${moduleConstructor}`) as T;
		assert(module !== undefined, `Module ${moduleConstructor} not decorated`);

		return module;
	}

	private initModules() {
		const constructors = Modding.getDecorators<typeof PlayerModuleDecorator>();

		constructors.forEach((obj) => {
			const instance = new obj.object(this as never);

			this.modules.set(`${obj.object}`, instance);
		});

		this.modules.forEach((module, key) => {
			const loadOrder = Reflect.getMetadata<number>(module, "playerModule:loadOrder") ?? 1;
			this.orderedModules.push([module, loadOrder]);
		});

		this.orderedModules.sort(([Aobject, Aorder], [Bobject, Border]) => {
			return Aorder < Border;
		});
	}

	public StopAnimation(animation: Animation) {
        const track = this.tracks.get(animation);
        if (!track) return;

        track.Stop();

        return track;
    }

    public PlayAnimation(animation: Animation): AnimationTrack {
        const animator = this.instance.Character?.FindFirstChildOfClass('Humanoid')?.FindFirstChildOfClass('Animator') as Animator;

        let track = this.tracks.get(animation);

        if (track !== undefined) {
            track.Play();
            return track;
        }

        track = animator.LoadAnimation(animation);
        track.Play();

        this.tracks.set(animation, track);

        return track;
    }

	public Kill() {
		const character = this.instance.Character;
		if (!character) return;

		const humnaoid = character.FindFirstChildOfClass('Humanoid');
		if (!humnaoid) return;

		humnaoid.TakeDamage(humnaoid.MaxHealth);
	}

	@Spawn
	public SetWalkspeed(value: number) {
		this.currentWalkspeed = value;

		const character = this.instance.Character || this.instance.CharacterAdded.Wait()[0];
		const humanoid = character.WaitForChild('Humanoid') as Humanoid;

		humanoid.WalkSpeed = this.currentWalkspeed;
	}

	@Spawn
	public GiveWalkspeed(value: number) {
		this.currentWalkspeed += value;

		const character = this.instance.Character || this.instance.CharacterAdded.Wait()[0];
		const humanoid = character.WaitForChild('Humanoid') as Humanoid;

		humanoid.WalkSpeed = this.currentWalkspeed;
	}

	@Spawn
	public TakeWalkspeed(value: number) {
		this.currentWalkspeed -= value;

		const character = this.instance.Character || this.instance.CharacterAdded.Wait()[0];
		const humanoid = character.WaitForChild('Humanoid') as Humanoid;

		humanoid.WalkSpeed = this.currentWalkspeed;
	}

	public GetReplicaAsync() {
		if (this.replica) return this.replica;
		this.WaitForInit();
		return this.replica;
	}

	public WaitForInit() {
		if (!this.waitingReplicaCreate) {
			this.waitingReplicaCreate = new Signal();
		}
		this.waitingReplicaCreate.Wait();
	}

	public GetProfileAsync() {
		if (this.profile) return this.profile;

		this.WaitForInit();
		return this.profile;
	}

	public GetValueInStatictics<T extends keyof ProfileData['Statistics']>(name: T): number {
		return this.profile.Data.Statistics[name];
	}

	public GiveValueInStatictics<T extends keyof ProfileData['Statistics']>(name: T, amount: number) {
		const value = this.GetValueInStatictics(name);

		amount = math.floor(amount);

		const AbsoluteStatisticName = Statistics.get(name)?.AbsoluteStatisticName;

		

		this.replica?.SetValue(`Profile.Statistics.${name}`, value + amount as never);
		this.OnChangedStatistics.Fire(name, value + amount);
	}

	public TakeValueInStatictics<T extends keyof ProfileData['Statistics']>(name: T, amount: number) {
		const value = this.GetValueInStatictics(name) as never;

		amount = math.floor(amount);

		this.replica?.SetValue(`Profile.Statistics.${name}`, value - amount as never);
		this.OnChangedStatistics.Fire(name, value - amount);
	}

	public SetValueInStatictics<T extends keyof ProfileData['Statistics']>(name: T, value: number) {
		this.replica?.SetValue(`Profile.Statistics.${name}`, value as never);
		this.OnChangedStatistics.Fire(name, value);
	}

	private initProfile() {
		this.profile = LoadProfile(this.instance) as Profile<ProfileData, ProfileMetadata>;

		if (this.profile === undefined) {
			this.instance.Kick('Profile not loaded. Please rejoin in game');
			return;
		}
	}

	private initReplica(dynamicData: DynamicData) {
		this.replica = ReplicaService.NewReplica({
			ClassToken: replicaPlayerDataToken,
			Data: {
				Profile: this.profile.Data,
				Dynamic: dynamicData,
			},
			WriteLib: ReplicatedStorage.WaitForChild('TS').WaitForChild('WriteLibs').WaitForChild('PlayerData') as ModuleScript,
			Replication: this.instance,
		});

		this.waitingReplicaCreate?.Fire();
	}

	private initCollision() {
		this.maid.GiveTask(this.instance.CharacterAdded.Connect((character) => {
			task.wait();
			character.GetChildren().forEach((bodyPart) => {
				if (!bodyPart.IsA("BasePart")) return;
				bodyPart.CollisionGroup = "Players";
			});
		}));

		if (this.instance.Character) {
			this.instance.Character.GetChildren().forEach((bodyPart) => {
				if (!bodyPart.IsA("BasePart")) return;
				bodyPart.CollisionGroup = "Players";
			});
		}
	}

	public OnLeft() {
		this.maid.GiveTask(this.OnLeaved);
		this.OnLeaved.Fire();
		pcall(() => {
			this.profile.Release();
			this.destroy();
		})
	}
}
