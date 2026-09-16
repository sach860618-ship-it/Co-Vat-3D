import * as THREE from 'three';
import { IState } from "../../../../../utils/StateMachine/IState";
import { calculateCameraRelativeDirection } from "../../../../../utils/three";
import { PlayerStateContext } from "./PlayerStateContext";

export class WalkState implements IState {
    public context: PlayerStateContext;
    public moveSpeed: number = 2;
    public turnSpeed: number = 10.0;

    private targetRotation = new THREE.Quaternion();
    private readonly yAxis = new THREE.Vector3(0, 1, 0);

    OnEnter(): void {
        this.context.playerController.playerAnimationController.changeToWalk();
    }

    Update(deltaTime: number): void {
        const inputListener = this.context.inputListener;
        const playerController = this.context.playerController;
        if (!inputListener || !playerController) return;

        const { forward, strafe } = inputListener.getMovement();
        const hasInput = inputListener.isMoving();
        const cannonBody = playerController.cannonBodyAttachBox?.cannonBody;
        const object3D = playerController.cannonBodyAttachBox?.object3D;

        if (hasInput) {
            let moveDir: THREE.Vector3;
            if (this.context.camera) {
                moveDir = calculateCameraRelativeDirection(this.context.camera, forward, strafe);
            } else {
                moveDir = new THREE.Vector3(strafe, 0, -forward).normalize();
            }

            if (this.context.isFirstPerson && this.context.camera) {
                const camDir = new THREE.Vector3();
                this.context.camera.getWorldDirection(camDir);
                camDir.y = 0;
                camDir.normalize();
                const targetAngle = Math.atan2(camDir.x, camDir.z);
                this.targetRotation.setFromAxisAngle(this.yAxis, targetAngle);
            } else {
                const targetAngle = Math.atan2(moveDir.x, moveDir.z);
                this.targetRotation.setFromAxisAngle(this.yAxis, targetAngle);
            }

            const effectiveTurnSpeed = this.context.isFirstPerson ? 25.0 : this.turnSpeed;
            const rotateFactor = 1 - Math.exp(- effectiveTurnSpeed * deltaTime);

            const inputMagnitude = Math.min(1, Math.hypot(forward, strafe));
            const currentSpeed = this.moveSpeed * (inputMagnitude > 0 ? inputMagnitude : 1);

            if (cannonBody) {
                cannonBody.wakeUp();
                cannonBody.velocity.x = moveDir.x * currentSpeed;
                cannonBody.velocity.z = moveDir.z * currentSpeed;
            } else if (object3D) {
                object3D.position.addScaledVector(moveDir, currentSpeed * deltaTime);
            }

            if (object3D) {
                object3D.quaternion.slerp(this.targetRotation, rotateFactor);
            }
        } else {
            this.context.playerController.clearVelocity();
        }
    }

    FixedUpdate(): void {

    }

    OnExit(): void {
        this.context.playerController.clearVelocity();
    }

}