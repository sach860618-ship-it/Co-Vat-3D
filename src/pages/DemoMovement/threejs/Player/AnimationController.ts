
import * as THREE from 'three';

export interface PlayOptions {
    fade?: number;
    loop?: THREE.AnimationActionLoopStyles;
    repetitions?: number;
}

export class AnimationController {
    public object: THREE.Object3D;
    public mixer: THREE.AnimationMixer;

    private actions: Map<string, THREE.AnimationAction> = new Map();

    private currentAction: THREE.AnimationAction | null = null;

    public createMixer(object: THREE.Object3D): void {
        this.object = object;
        this.mixer = new THREE.AnimationMixer(object);
    }

    public add(clip: THREE.AnimationClip, name: string): THREE.AnimationAction {
        if (this.actions.has(name)) {
            throw new Error(
                `[AnimationController] Animation "${name}" already exists.`
            );
        }
        const action = this.mixer.clipAction(clip);
        this.actions.set(name, action);
        return action;
    }
    public play(name: string, options: PlayOptions): THREE.AnimationAction {

        const nextAction = this.actions.get(name);

        if (!nextAction) {
            console.warn(
                `[AnimationController] Animation "${name}" not found.`,
                `Available animations: `,
                Array.from(this.actions.keys())
            );

            return null;
        }

        // Animation hiện tại đã đúng animation cần chạy
        if (this.currentAction === nextAction) {
            return nextAction;
        }

        // Setup animation mới
        nextAction.reset();
        nextAction.setLoop(options.loop, options.repetitions);

        nextAction.clampWhenFinished = options.loop === THREE.LoopOnce;

        /*
         * Blend animation cũ -> animation mới.
         *
         * crossFadeTo sẽ tự fade animation hiện tại ra
         * và fade animation mới vào.
         */
        if (this.currentAction) {
            this.currentAction.crossFadeTo(
                nextAction,
                options.fade,
                true
            );
        } else {
            nextAction.fadeIn(options.fade);
        }

        nextAction.play();

        this.currentAction = nextAction;

        return nextAction;
    }

    /**
     * Stop current animation.
     */
    public stop(fade: number = 0.2): void {
        if (!this.currentAction) {
            return;
        }

        this.currentAction.fadeOut(fade);
        this.currentAction = null;
    }

    /**
     * Stop all animations immediately.
     */
    public stopAll(): void {
        this.mixer.stopAllAction();
        this.currentAction = null;
    }

    /**
     * Pause current animation.
     */
    public pause(): void {
        if (!this.currentAction) {
            return;
        }

        this.currentAction.paused = true;
    }

    /**
     * Resume current animation.
     */
    public resume(): void {
        if (!this.currentAction) {
            return;
        }

        this.currentAction.paused = false;
    }

    /**
     * Set animation playback speed.
     *
     * 1    = normal
     * 0.5  = half speed
     * 2    = double speed
     */
    public setSpeed(speed: number): void {
        this.mixer.timeScale = speed;
    }

    /**
     * Get current animation name.
     */
    public getCurrentAnimation(): string | null {
        if (!this.currentAction) {
            return null;
        }

        return this.currentAction.getClip().name;
    }

    /**
     * Check if animation exists.
     */
    public has(name: string): boolean {
        return this.actions.has(name);
    }

    /**
     * Get animation action.
     */
    public get(
        name: string
    ): THREE.AnimationAction | undefined {
        return this.actions.get(name);
    }

    /**
     * Get all animation names.
     */
    public getAnimationNames(): string[] {
        return Array.from(this.actions.keys());
    }

    /**
     * Remove an animation.
     */
    public remove(name: string): void {
        const action = this.actions.get(name);

        if (!action) {
            return;
        }

        action.stop();

        if (this.currentAction === action) {
            this.currentAction = null;
        }

        this.actions.delete(name);
    }

    /**
     * Update animation.
     *
     * Call this inside requestAnimationFrame().
     */
    public update(deltaTime: number): void {
        if (!this.mixer) {
            return;
        }
        this.mixer.update(deltaTime);
    }

    /**
     * Dispose controller.
     */
    public dispose(): void {
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer.uncacheRoot(this.object);
        }

        this.actions.clear();
        this.currentAction = null;
    }
}