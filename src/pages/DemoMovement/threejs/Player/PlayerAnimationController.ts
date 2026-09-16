import { AnimationController } from "./AnimationController";
import * as THREE from 'three';

export class PlayerAnimationName {
    public static Idle = "Idle";
    public static Walk = "Walk";
    public static Typing = "Typing";
    public static Sleep = "Sleep";
    public static Sit = "Sit";
    public static Carry = "Carry";
}

export class PlayerAnimationController {
    public animationController: AnimationController = new AnimationController();

    public changeToIdle(): void {
        this.animationController.play(PlayerAnimationName.Idle, {
            loop: THREE.LoopRepeat,
            fade: 0.2,
            repetitions: Infinity
        });
    }
    public changeToWalk(): void {
        this.animationController.play(PlayerAnimationName.Walk, {
            loop: THREE.LoopRepeat,
            fade: 0.2,
            repetitions: Infinity
        });
    }
    public changeToSit(): void {
        this.animationController.play(PlayerAnimationName.Sit, {
            loop: THREE.LoopRepeat,
            fade: 0.2,
            repetitions: Infinity
        });
    }
}

