import * as THREE from 'three';
import { ThreeBehaviour } from '../../../utils/three/ThreeBehaviour';
import { ThreeAnimation } from '../../../utils/three/ThreeAnimation';
import { calculateCameraRelativeDirection } from '../../../utils/three';
import { PlayerAnimationKey } from './PlayerLoader';

import { ColliderManager } from '../Collision/ColliderManager';

export interface PlayerMovementOptions {
    camera: THREE.Camera;
    animation: ThreeAnimation;
    moveSpeed?: number;
    turnSpeed?: number;
    fadeDuration?: number;
    colliderManager?: ColliderManager;
    playerRadius?: number;
}

export class PlayerMovementBehaviour extends ThreeBehaviour {
    public camera: THREE.Camera;
    public animation: ThreeAnimation;
    public moveSpeed: number;
    public turnSpeed: number;
    public fadeDuration: number;
    public colliderManager?: ColliderManager;
    public playerRadius: number;

    private keysPressed = new Set<string>();
    private isMoving = false;
    private targetRotation = new THREE.Quaternion();
    private readonly yAxis = new THREE.Vector3(0, 1, 0);

    constructor(options: PlayerMovementOptions) {
        super();
        this.camera = options.camera;
        this.animation = options.animation;
        this.moveSpeed = options.moveSpeed ?? 4.0;
        this.turnSpeed = options.turnSpeed ?? 10.0;
        this.fadeDuration = options.fadeDuration ?? 0.2;
        this.colliderManager = options.colliderManager;
        this.playerRadius = options.playerRadius ?? 0.4;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    public override Start() {
        super.Start();
        if (this.object) {
            this.targetRotation.copy(this.object.quaternion);
        }
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown(e: KeyboardEvent) {
        this.keysPressed.add(e.code);
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.keysPressed.delete(e.code);
    }

    public override Update(deltaTime: number) {
        if (!this.object) return;

        let forward = 0;
        let strafe = 0;

        if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) forward += 1;
        if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) forward -= 1;
        if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) strafe -= 1;
        if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) strafe += 1;

        const hasInput = forward !== 0 || strafe !== 0;

        if (hasInput) {
            const moveDir = calculateCameraRelativeDirection(this.camera, forward, strafe);

            // Tính toán khoảng dịch chuyển dự kiến
            let displacement = moveDir.clone().multiplyScalar(this.moveSpeed * deltaTime);

            // Nếu có ColliderManager, giải quyết va chạm (ngăn đi xuyên vật thể và trượt dọc cạnh)
            if (this.colliderManager) {
                displacement = this.colliderManager.resolveMovement(
                    this.object.position,
                    displacement,
                    this.playerRadius
                );
            }

            // Cập nhật toạ độ nhân vật
            this.object.position.add(displacement);

            // Cập nhật hướng xoay đích
            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            this.targetRotation.setFromAxisAngle(this.yAxis, targetAngle);

            if (!this.isMoving) {
                this.isMoving = true;
                this.animation.play(PlayerAnimationKey.Walk, this.fadeDuration);
            }
        } else {
            if (this.isMoving) {
                this.isMoving = false;
                this.animation.play(PlayerAnimationKey.Idle, this.fadeDuration);
            }
        }

        // Xoay nhân vật mượt mà theo Quaternion SLERP
        const rotateFactor = 1 - Math.exp(-this.turnSpeed * deltaTime);
        this.object.quaternion.slerp(this.targetRotation, rotateFactor);

        // Đồng bộ vị trí khung collider helper của player liên tục theo toạ độ nhân vật
        if (this.colliderManager) {
            this.colliderManager.updatePlayerHelper();
        }

        super.Update(deltaTime);
    }

    public dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keysPressed.clear();
    }
}