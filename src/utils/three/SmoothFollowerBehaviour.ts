import * as THREE from 'three';
import { ThreeBehaviour } from './ThreeBehaviour';

export interface SmoothFollowerOptions {
    target: THREE.Object3D;
    offset?: THREE.Vector3;
    lookAtOffset?: THREE.Vector3;
    smoothSpeed?: number;
    lookSmoothSpeed?: number;
    followRotation?: boolean;
}

export class SmoothFollowerBehaviour extends ThreeBehaviour {
    public target: THREE.Object3D;
    public offset: THREE.Vector3;
    public lookAtOffset: THREE.Vector3;
    public smoothSpeed: number;
    public lookSmoothSpeed: number;
    public followRotation: boolean;

    private currentLookAt = new THREE.Vector3();
    private tempTargetPos = new THREE.Vector3();
    private tempDesiredPos = new THREE.Vector3();
    private tempRotatedOffset = new THREE.Vector3();
    private tempLookAtTarget = new THREE.Vector3();
    private isInitialized = false;

    constructor(options: SmoothFollowerOptions) {
        super();
        this.target = options.target;
        this.offset = options.offset ?? new THREE.Vector3(0, 7, 6.0);
        this.lookAtOffset = options.lookAtOffset ?? new THREE.Vector3(0, 1.2, 0);
        this.smoothSpeed = options.smoothSpeed ?? 5.0;
        this.lookSmoothSpeed = options.lookSmoothSpeed ?? 10.0;
        this.followRotation = options.followRotation ?? false;
    }

    public override Start() {
        super.Start();
        if (!this.object || !this.target) return;

        this.snapToTarget();
    }

    /**
     * Đặt camera/object ngay lập tức vào vị trí theo dõi đích mà không lerp (tránh giật hình ban đầu).
     */
    public snapToTarget() {
        if (!this.object || !this.target) return;

        this.calculateDesiredPosition(this.tempDesiredPos);
        this.object.position.copy(this.tempDesiredPos);

        this.target.getWorldPosition(this.tempTargetPos);
        this.currentLookAt.copy(this.tempTargetPos).add(this.lookAtOffset);
        this.object.lookAt(this.currentLookAt);

        this.isInitialized = true;
    }

    private calculateDesiredPosition(outPos: THREE.Vector3) {
        this.target.getWorldPosition(this.tempTargetPos);

        if (this.followRotation) {
            this.tempRotatedOffset.copy(this.offset).applyQuaternion(this.target.quaternion);
            outPos.copy(this.tempTargetPos).add(this.tempRotatedOffset);
        } else {
            outPos.copy(this.tempTargetPos).add(this.offset);
        }
    }

    public override LateUpdate(deltaTime: number) {
        if (!this.object || !this.target) return;

        if (!this.isInitialized) {
            this.snapToTarget();
            return;
        }

        // Tính vị trí mục tiêu mong muốn
        this.calculateDesiredPosition(this.tempDesiredPos);

        // Frame-rate independent lerp factor cho vị trí
        const posFactor = 1 - Math.exp(-this.smoothSpeed * deltaTime);
        this.object.position.lerp(this.tempDesiredPos, posFactor);

        // Tính điểm ngắm mục tiêu
        this.target.getWorldPosition(this.tempTargetPos);
        this.tempLookAtTarget.copy(this.tempTargetPos).add(this.lookAtOffset);

        // Frame-rate independent lerp factor cho hướng nhìn
        const lookFactor = 1 - Math.exp(-this.lookSmoothSpeed * deltaTime);
        this.currentLookAt.lerp(this.tempLookAtTarget, lookFactor);

        this.object.lookAt(this.currentLookAt);

        super.LateUpdate(deltaTime);
    }
}
