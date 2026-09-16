import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IState } from '../../../../utils/StateMachine/IState';
import { PerspectiveContext } from './PerspectiveContext';

export class ThirdPersonViewState implements IState {
    public context: PerspectiveContext;
    public orbitControls?: OrbitControls;

    private tempTargetPos = new THREE.Vector3();
    private tempDeltaMove = new THREE.Vector3();
    private isCameraFollowInitialized = false;

    public OnEnter(): void {
        this.syncPlayerVisibility();

        if (this.context.playerController?.playerStateMachine?.context) {
            this.context.playerController.playerStateMachine.context.isFirstPerson = false;
        }

        if (!this.orbitControls && this.context.camera && this.context.domElement) {
            this.orbitControls = new OrbitControls(this.context.camera, this.context.domElement);
            this.orbitControls.enableDamping = true;
            this.orbitControls.dampingFactor = 0.05;
            this.orbitControls.maxDistance = 60;
            this.orbitControls.minDistance = 2;
        }

        if (this.orbitControls) {
            this.orbitControls.enabled = true;
            const playerObj = this.context.playerController?.cannonBodyAttachBox?.object3D;
            if (playerObj && this.context.camera) {
                const playerPos = playerObj.position;
                this.orbitControls.target.copy(playerPos).add(this.context.cameraTargetOffset);
                this.context.camera.position.set(playerPos.x, playerPos.y + 3, playerPos.z + 5);
                this.isCameraFollowInitialized = true;
                this.orbitControls.update();
            }
        }
    }

    public Update(deltaTime: number): void {
        const playerObj = this.context.playerController?.cannonBodyAttachBox?.object3D;
        if (playerObj && this.context.camera && this.orbitControls) {
            const playerPos = playerObj.position;
            this.tempTargetPos.copy(playerPos).add(this.context.cameraTargetOffset);

            if (!this.isCameraFollowInitialized) {
                const initialDelta = this.tempTargetPos.clone().sub(this.orbitControls.target);
                this.orbitControls.target.add(initialDelta);
                this.context.camera.position.add(initialDelta);
                this.isCameraFollowInitialized = true;
            } else {
                const lerpFactor = 1 - Math.exp(-this.context.cameraFollowSpeed * deltaTime);
                this.tempDeltaMove.copy(this.tempTargetPos).sub(this.orbitControls.target).multiplyScalar(lerpFactor);

                this.orbitControls.target.add(this.tempDeltaMove);
                this.context.camera.position.add(this.tempDeltaMove);
            }

            this.orbitControls.update();
        }
    }

    public FixedUpdate(): void {
        // Không dùng cho góc nhìn
    }

    public OnExit(): void {
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }
    }

    public syncPlayerVisibility(): void {
        const playerObj = this.context.playerController?.cannonBodyAttachBox?.object3D;
        if (playerObj) {
            playerObj.visible = true;
        }
    }

    public resetFollowInitialization(): void {
        this.isCameraFollowInitialized = false;
    }

    public dispose(): void {
        this.OnExit();
        this.orbitControls?.dispose();
        this.orbitControls = undefined;
        this.isCameraFollowInitialized = false;
    }
}
