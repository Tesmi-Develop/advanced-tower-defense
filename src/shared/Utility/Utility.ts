import { Constructor } from "@flamework/core/out/types";
import { RunService, Workspace } from "@rbxts/services";

export const Day = 86400;
export const Hour = 3600;
export const Minute = 60;

export const FindFirstAncestorOfClassWithPredict = <T extends keyof Instances>(instance: Instance, className: T, predict: (Instance: Instances[T]) => boolean) => {
    let needInstance: Instance | undefined = instance

    while (needInstance !== undefined) {
        needInstance = needInstance.FindFirstAncestorOfClass(className);

        if (needInstance === undefined) break;

        if (predict(needInstance as Instances[T])) {
            return needInstance
        }
    }

    return undefined;
}

export const GetRandomNumberFromNumberRange = (value:  NumberRange) => {
    return math.random(value.Min, value.Max);
}

export const GetCharactersFromHits = (hitsList: BasePart[], onlyHumanoidRootPart = false) => {
    type Character = Model & {Humanoid: Humanoid};
    const characters = new Set<Character>();

    hitsList.forEach((hit) => {
        if (onlyHumanoidRootPart && hit.Name !== 'HumanoidRootPart') return;
        
        const character = hit.FindFirstAncestorOfClass('Model');
        const humanoid = character?.FindFirstChildOfClass('Humanoid');

        if (!character) return;
        if (characters.has(character as Character)) return;
        if (!humanoid) return;
        if (humanoid.Health <= 0) return;

        characters.add(character as Character);
    });

    return characters;
}

export const CreateHitboxPart = (cframe?: CFrame, size?: Vector3, transparency?: number, color?: Color3) => {
    const part = new Instance("Part");

    part.CanCollide = false;
    part.CanQuery = false;
    part.CastShadow = false;
    part.CanTouch = false;
    part.Massless = true;
    part.TopSurface = Enum.SurfaceType.Smooth;
    part.Size = size || new Vector3(1, 1, 1)
    part.CFrame = cframe || new CFrame(0, 0, 0);
    part.Transparency = transparency || 0.7;
    part.Color = color || new Color3(0, 0, 1);
    part.Parent = Workspace;
    part.TopSurface = Enum.SurfaceType.Smooth;
    part.BackSurface = Enum.SurfaceType.Smooth;
    part.FrontSurface = Enum.SurfaceType.Smooth;
    part.BottomSurface = Enum.SurfaceType.Smooth;
    part.RightSurface = Enum.SurfaceType.Smooth;
    part.LeftSurface = Enum.SurfaceType.Smooth;
    
    if (RunService.IsServer()) {
        part.SetNetworkOwner(undefined);
    }
    
    return part;
}

export const CreatePointPart = (cframe?: CFrame, size?: Vector3, transparency?: number, color?: Color3) => {
    const part = new Instance("Part");

    part.CanCollide = false;
    part.CanQuery = false;
    part.CastShadow = false;
    part.CanTouch = false;
    part.Massless = true;
    part.Anchored = true;
    part.TopSurface = Enum.SurfaceType.Smooth;
    part.Size = size || new Vector3(1, 1, 1)
    part.CFrame = cframe || new CFrame(0, 0, 0);
    part.Transparency = transparency || 0.7;
    part.Color = color || new Color3(0, 0, 1);
    part.Parent = Workspace;
    
    if (RunService.IsServer()) {
        part.SetNetworkOwner(undefined);
    }
    
    return part;
}

export const CreateWeldConstraint = (part1: BasePart, part2: BasePart) => {
    const weld = new Instance("WeldConstraint");
    weld.Part0 = part1;
    weld.Part1 = part2;

    return weld;
}

export const GetLenghtAnimation = (track: AnimationTrack) => track.Length / track.Speed;

export const Lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Returns the class name of the given object.
 *
 * @param {object} object - The object whose class name is to be returned.
 * @return {string} The class name of the object.
 */
export const GetClassName = (object: object) => {
    return `${getmetatable(object)}`;
}

export const GetClass = <T extends object>(instance: T): Constructor<T> => {
    return getmetatable(instance) as Constructor<T>;
}

export const UnchorInstances = (instance: Instance) => {
    instance.GetDescendants().forEach((child) => {
        if (!child.IsA("BasePart")) return;
        child.Anchored = false;
    })
}

export const WeldAllDescendants = (model: Model | Accessory, canCollide = false) => {
    const primaryPart = model.IsA('Model') ? model.PrimaryPart : model.FindFirstChild('Handle') as BasePart;

    if (!primaryPart && model.IsA("Model")) {
        const part = model.FindFirstChildWhichIsA("BasePart");
        assert(part, 'Not found primaryPart and cant find any BasePart');
        model.PrimaryPart = part;
        warn("PrimaryPart not found, using first BasePart");
    }
    
    model.GetDescendants().forEach((child) => {
        if (!child.IsA("BasePart")) return;
        if (child === primaryPart) return;

        child.Anchored = false;
        child.CanCollide = canCollide;

        const weld = new Instance("WeldConstraint");
        weld.Part0 = primaryPart;
        weld.Part1 = child;

        weld.Parent = primaryPart;
    })
}

export const GetPointOnCircle2D = (angle: number, radius: number) => {
    const x = math.cos(math.rad(angle)) * radius;
	const y = math.sin(math.rad(angle)) * radius;

	return new Vector2(x, y);
}

export const IsNaN = (number: number) => number !== number;

export const GetPointInCircle = (angle: number, raduis: number) => {
    const x = math.sin(math.rad(angle)) * raduis;
    const z = math.cos(math.rad(angle)) * raduis;

    return new Vector3(x, 0, z);
}

export const ConvertTimeToText = (time: number) => {
    let str = `${math.floor(time)} Sec`;

    if (time >= Minute) {
        str = `${math.floor(time / Minute)} Min`;
    }

    if (time >= Hour) {
        str = `${math.floor(time / Hour)} Hours`;
    }

    return str;
}

export const ConcatArraies = <T extends defined, C extends defined>(array1: T[], array2: C[]): (T | C)[] => {
    const result = array1 as (T | C)[];

    array2.forEach((value) => {
        result.push(value);
    });

    return result;
}

export const AddAccessory = (accessory: Accessory, humanoid: Humanoid, weldOffest: CFrame) => {
    humanoid.AddAccessory(accessory);

    const primaryPart = accessory.FindFirstChild('Handle') as BasePart;
    assert(primaryPart, 'Not found Handle');

    const originalSize = primaryPart.WaitForChild('OriginalSize') as Vector3Value;
    primaryPart.Size = originalSize.Value;

    const weld = primaryPart.WaitForChild('AccessoryWeld') as Weld;
    weld.C1 = weldOffest;
    
    const originalWeldOffset = new Instance('CFrameValue', weld);
    originalWeldOffset.Name = 'OriginalWeldOffest';
    originalWeldOffset.Value = weldOffest;
}

export const GetCurrentTime = (isRound = false): number => {
    return isRound ? math.round(Workspace.GetServerTimeNow()) : Workspace.GetServerTimeNow();
}

export const GetDifferenceNowTime = (time: number, isRound = false): number => {
    return isRound ? math.round(time - Workspace.GetServerTimeNow()) : (time - Workspace.GetServerTimeNow())
}