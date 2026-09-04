import * as THREE from 'three';
import { ThreeBehaviour } from './ThreeBehaviour';

export interface CameraColliderResolver {
    checkCameraCollision(
        origin: THREE.Vector3,
        direction: THREE.Vector3,
        maxDistance: number,
        padding?: number
    ): number | null;
}

export interface ThirdPersonOrbitOptions {
    target: THREE.Object3D;
    domElement?: HTMLElement | Window;
    targetOffset?: THREE.Vector3;
    distance?: number;
    minDistance?: number;
    maxDistance?: number;
    rotateSpeed?: number;
    zoomSpeed?: number;
    smoothSpeed?: number;
    collisionZoomInSpeed?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    initialTheta?: number;
    initialPhi?: number;
    colliderManager?: CameraColliderResolver;
    collisionPadding?: number;
}

/**
 * Behaviour điều khiển camera góc nhìn thứ ba xoay quanh mục tiêu (Player).
 * Hỗ trợ kéo chuột để xoay ngang/dọc (Orbit), cuộn chuột để zoom (Dolly),
 * và tự động co khoảng cách (Zoom-in / Camera Collider) khi bị vướng vật cản giống Unity Cinemachine.
 */
export class ThirdPersonOrbitBehaviour extends ThreeBehaviour {
    public target: THREE.Object3D;
    public domElement: HTMLElement | Window;
    public targetOffset: THREE.Vector3;
    public distance: number;
    public minDistance: number;
    public maxDistance: number;
    public rotateSpeed: number;
    public zoomSpeed: number;
    public smoothSpeed: number;
    public collisionZoomInSpeed: number;
    public minPolarAngle: number;
    public maxPolarAngle: number;
    public colliderManager?: CameraColliderResolver;
    public collisionPadding: number;

    private currentTheta: number;
    private currentPhi: number;
    private currentDistance: number;

    private targetTheta: number;
    private targetPhi: number;
    private targetDistance: number;

    private isDragging = false;
    private previousMousePosition = { x: 0, y: 0 };
    private spherical = new THREE.Spherical();

    private tempTargetPos = new THREE.Vector3();
    private tempLookAtTarget = new THREE.Vector3();
    private tempOffsetPos = new THREE.Vector3();
    private tempRayDirection = new THREE.Vector3();
    private isInitialized = false;

    constructor(options: ThirdPersonOrbitOptions) {
        super();
        this.target = options.target;
        this.domElement = options.domElement ?? window;
        this.targetOffset = options.targetOffset ?? new THREE.Vector3(0, 1.2, 0);

        this.distance = options.distance ?? 10.0;
        this.minDistance = options.minDistance ?? 1.5;
        this.maxDistance = options.maxDistance ?? 25.0;

        this.rotateSpeed = options.rotateSpeed ?? 0.005;
        this.zoomSpeed = options.zoomSpeed ?? 0.01;
        this.smoothSpeed = options.smoothSpeed ?? 10.0;
        this.collisionZoomInSpeed = options.collisionZoomInSpeed ?? 25.0;
        this.colliderManager = options.colliderManager;
        this.collisionPadding = options.collisionPadding ?? 0.35;

        this.minPolarAngle = options.minPolarAngle ?? THREE.MathUtils.degToRad(15);
        this.maxPolarAngle = options.maxPolarAngle ?? THREE.MathUtils.degToRad(82);

        this.currentTheta = options.initialTheta ?? 0;
        this.currentPhi = options.initialPhi ?? THREE.MathUtils.degToRad(55);
        this.currentDistance = this.distance;

        this.targetTheta = this.currentTheta;
        this.targetPhi = this.currentPhi;
        this.targetDistance = this.currentDistance;

        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    public override Start() {
        super.Start();
        if (!this.object || !this.target) return;

        const targetEl = this.domElement;
        targetEl.addEventListener('pointerdown', this.handlePointerDown as EventListener);
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
        targetEl.addEventListener('wheel', this.handleWheel as EventListener, { passive: false });

        this.snapToTarget();
    }

    public snapToTarget() {
        if (!this.object || !this.target) return;

        this.target.getWorldPosition(this.tempTargetPos);
        this.tempLookAtTarget.copy(this.tempTargetPos).add(this.targetOffset);

        let safeDistance = this.targetDistance;
        if (this.colliderManager) {
            this.tempRayDirection.setFromSphericalCoords(1, this.targetPhi, this.targetTheta);
            const hitDistance = this.colliderManager.checkCameraCollision(
                this.tempLookAtTarget,
                this.tempRayDirection,
                this.targetDistance,
                this.collisionPadding
            );
            if (hitDistance !== null) {
                safeDistance = Math.max(this.minDistance, Math.min(this.targetDistance, hitDistance));
            }
        }

        this.currentDistance = safeDistance;
        this.currentTheta = this.targetTheta;
        this.currentPhi = this.targetPhi;

        this.spherical.set(this.currentDistance, this.currentPhi, this.currentTheta);
        this.spherical.makeSafe();
        this.tempOffsetPos.setFromSpherical(this.spherical);

        this.object.position.copy(this.tempLookAtTarget).add(this.tempOffsetPos);
        this.object.lookAt(this.tempLookAtTarget);
        this.isInitialized = true;
    }

    private handlePointerDown(e: PointerEvent) {
        // Chỉ xử lý khi nhấn chuột trái (button 0) hoặc chuột phải (button 2)
        if (e.button !== 0 && e.button !== 2) return;

        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    private handlePointerMove(e: PointerEvent) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetTheta -= deltaX * this.rotateSpeed;
        this.targetPhi -= deltaY * this.rotateSpeed;

        // Giới hạn góc ngẩng để tránh lộn ngược camera hoặc xuyên qua sàn
        this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, this.minPolarAngle, this.maxPolarAngle);

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    private handlePointerUp(_e: PointerEvent) {
        this.isDragging = false;
    }

    private handleWheel(e: WheelEvent) {
        e.preventDefault();
        this.targetDistance += e.deltaY * this.zoomSpeed;
        this.targetDistance = THREE.MathUtils.clamp(this.targetDistance, this.minDistance, this.maxDistance);
    }

    public override LateUpdate(deltaTime: number) {
        if (!this.object || !this.target) return;

        if (!this.isInitialized) {
            this.snapToTarget();
            return;
        }

        // 1. Làm mịn góc quay ngang và dọc
        const angleFactor = 1 - Math.exp(-this.smoothSpeed * deltaTime);
        this.currentTheta = THREE.MathUtils.lerp(this.currentTheta, this.targetTheta, angleFactor);
        this.currentPhi = THREE.MathUtils.lerp(this.currentPhi, this.targetPhi, angleFactor);

        // 2. Lấy vị trí mục tiêu nhìn (LookAt target)
        this.target.getWorldPosition(this.tempTargetPos);
        this.tempLookAtTarget.copy(this.tempTargetPos).add(this.targetOffset);

        // 3. Kiểm tra va chạm camera collider (Cinemachine style)
        let allowedDistance = this.targetDistance;
        if (this.colliderManager) {
            // Hướng tia từ LookAt target về phía góc quay hiện tại của camera
            this.tempRayDirection.setFromSphericalCoords(1, this.currentPhi, this.currentTheta);
            const hitDistance = this.colliderManager.checkCameraCollision(
                this.tempLookAtTarget,
                this.tempRayDirection,
                this.targetDistance,
                this.collisionPadding
            );
            if (hitDistance !== null) {
                allowedDistance = Math.max(this.minDistance, Math.min(this.targetDistance, hitDistance));
            }
        }

        // 4. Điều chỉnh khoảng cách:
        // - Khi bị cản (zoom vào): phản ứng nhanh/tức thì (collisionZoomInSpeed) để không bị xuyên tường
        // - Khi hết vật cản (zoom ra lại): mượt mà giãn ra (smoothSpeed)
        if (allowedDistance < this.currentDistance) {
            const zoomInFactor = 1 - Math.exp(-this.collisionZoomInSpeed * deltaTime);
            this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, allowedDistance, zoomInFactor);
        } else {
            const zoomOutFactor = 1 - Math.exp(-this.smoothSpeed * deltaTime);
            this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, allowedDistance, zoomOutFactor);
        }

        // 5. Cập nhật vị trí camera từ hệ toạ độ cầu và hướng nhìn về target
        this.spherical.set(this.currentDistance, this.currentPhi, this.currentTheta);
        this.spherical.makeSafe();
        this.tempOffsetPos.setFromSpherical(this.spherical);

        this.object.position.copy(this.tempLookAtTarget).add(this.tempOffsetPos);
        this.object.lookAt(this.tempLookAtTarget);

        super.LateUpdate(deltaTime);
    }

    public dispose() {
        const targetEl = this.domElement;
        targetEl.removeEventListener('pointerdown', this.handlePointerDown as EventListener);
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerup', this.handlePointerUp);
        targetEl.removeEventListener('wheel', this.handleWheel as EventListener);
        this.isDragging = false;
    }
}
