type Returned<T> = T extends Animation ? AnimationTrack : undefined

export class AnimatorComponent {
    private animator: Animator;
    private loadedAnimations = new Map<Animation, AnimationTrack>();
    private currentAnimation?: Animation;

    constructor(animator: Animator) {
        this.animator = animator;
    }

    public PlayAnimation(animation: Animation, speed?: number) {
        let track = this.loadedAnimations.get(animation);

        if (!track) {
            track = this.animator.LoadAnimation(animation);
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

        if (animation === oldAnimation) return animation as Returned<T>;

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
}