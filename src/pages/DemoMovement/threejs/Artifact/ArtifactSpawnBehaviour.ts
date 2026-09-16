import * as THREE from 'three';
import { ThreeBehaviour } from '../../../../utils/three/ThreeBehaviour';

export class ArtifactSpawnBehaviour extends ThreeBehaviour {
    private targetScale: THREE.Vector3;
    private duration: number;
    private elapsedTime: number = 0;
    private isFinished: boolean = false;
    private onComplete?: () => void;
    private ringMesh?: THREE.Mesh;
    private ringMaterial?: THREE.MeshBasicMaterial;
    private group?: THREE.Object3D;

    private initialized: boolean = false;

    constructor(
        targetScale: THREE.Vector3,
        duration: number = 0.65,
        group?: THREE.Object3D,
        onComplete?: () => void
    ) {
        super();
        this.targetScale = targetScale.clone();
        this.duration = Math.max(0.1, duration);
        this.group = group;
        this.onComplete = onComplete;
    }

    private initSpawn(): void {
        if (this.initialized || !this.object) return;
        this.initialized = true;

        this.object.scale.set(0.001, 0.001, 0.001);

        // Tạo hiệu ứng vòng sáng phát quang (Glow Aura Ring) tại chân mô hình
        if (this.group) {
            const ringGeo = new THREE.RingGeometry(0.15, 0.35, 32);
            this.ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            this.ringMesh = new THREE.Mesh(ringGeo, this.ringMaterial);
            this.ringMesh.rotation.x = -Math.PI / 2;
            this.ringMesh.position.copy(this.object.position);
            this.ringMesh.position.y -= 0.15; // Hạ sát mặt bệ
            this.group.add(this.ringMesh);
        }
    }

    public override Start(): void {
        super.Start();
        this.initSpawn();
    }

    public override Update(deltaTime: number): void {
        if (!this.initialized) {
            this.initSpawn();
        }

        if (this.isFinished || !this.object) {
            super.Update(deltaTime);
            return;
        }

        this.elapsedTime += deltaTime;
        const rawProgress = Math.min(1, this.elapsedTime / this.duration);

        // Back-Out Easing: nảy nhẹ qua 100% rồi trở lại kích thước chuẩn
        const c1 = 1.35;
        const p = rawProgress - 1;
        const scaleFactor = Math.max(0, 1 + (c1 + 1) * Math.pow(p, 3) + c1 * Math.pow(p, 2));

        this.object.scale.set(
            this.targetScale.x * scaleFactor,
            this.targetScale.y * scaleFactor,
            this.targetScale.z * scaleFactor
        );

        // Vòng sáng tỏa rộng và mờ dần
        if (this.ringMesh && this.ringMaterial) {
            const ringScale = 1 + rawProgress * 5.0;
            this.ringMesh.scale.set(ringScale, ringScale, ringScale);
            this.ringMaterial.opacity = Math.max(0, (1 - rawProgress) * 0.85);
        }

        // Xoay nhanh nhẹ trong lúc xuất hiện tạo cảm giác triệu hồi sống động
        const extraSpin = (1 - rawProgress) * 1.8;
        this.object.rotation.y += (0.4 + extraSpin) * deltaTime;

        if (rawProgress >= 1) {
            this.isFinished = true;
            this.object.scale.copy(this.targetScale);

            // Dọn dẹp vòng sáng
            if (this.ringMesh && this.group) {
                this.group.remove(this.ringMesh);
                this.ringMesh.geometry.dispose();
                this.ringMaterial?.dispose();
                this.ringMesh = undefined;
            }

            this.onComplete?.();
        }

        super.Update(deltaTime);
    }
}
