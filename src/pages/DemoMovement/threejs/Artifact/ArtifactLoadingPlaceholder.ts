import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ThreeBehaviour } from '../../../../utils/three/ThreeBehaviour';
import { ArtifactPlaceholderCard } from './ArtifactPlaceholderCard';

export class PlaceholderRotateBehaviour extends ThreeBehaviour {
    private placeholder: ArtifactLoadingPlaceholder;

    constructor(placeholder: ArtifactLoadingPlaceholder) {
        super();
        this.placeholder = placeholder;
    }

    public override Update(deltaTime: number): void {
        this.placeholder.update(deltaTime);
        super.Update(deltaTime);
    }
}

export class ArtifactLoadingPlaceholder {
    public group: THREE.Group;
    public isWarning: boolean = false;
    public artifactId: string;
    public artifactName: string;
    private cubeMesh: THREE.Mesh;
    private wireframeMesh: THREE.LineSegments;
    private cubeMaterial: THREE.MeshStandardMaterial;
    private wireframeMaterial: THREE.LineBasicMaterial;
    private cssObject: CSS2DObject;
    private domElement: HTMLDivElement;
    private root: Root;
    private currentPct: number = 0;

    private parent: THREE.Object3D;
    private onRetry?: () => void;
    private elapsedTime: number = 0;
    private isExiting: boolean = false;
    private exitDuration: number = 0.4;
    private exitElapsed: number = 0;
    private isDisposed: boolean = false;

    constructor(
        parent: THREE.Object3D,
        position: THREE.Vector3,
        artifactName: string,
        size: number = 1.3,
        artifactId: string = '',
        onRetry?: () => void
    ) {
        this.parent = parent;
        this.artifactName = artifactName;
        this.artifactId = artifactId;
        this.onRetry = onRetry;
        this.group = new THREE.Group();

        // Gắn metadata để phục vụ Raycasting nhận diện khi click vào mesh
        this.group.userData = { isPlaceholder: true, artifactId: this.artifactId, placeholder: this };

        // Nâng độ cao cube lên khỏi mặt sàn/bệ trưng bày để nhìn rõ
        this.group.position.set(position.x, position.y + size * 0.5 + 0.3, position.z);

        // 1. Lõi khối lập phương phát sáng Neon Cyan kiểu Hologram (Pure GPU)
        const geometry = new THREE.BoxGeometry(size, size, size);
        this.cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            emissive: 0x0284c7,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.55,
            roughness: 0.2,
            metalness: 0.6,
        });
        this.cubeMesh = new THREE.Mesh(geometry, this.cubeMaterial);
        this.cubeMesh.userData = { isPlaceholder: true, artifactId: this.artifactId, placeholder: this };
        this.group.add(this.cubeMesh);

        // 2. Khung viền wireframe phát sáng rực rỡ
        const edges = new THREE.EdgesGeometry(geometry);
        this.wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.95,
        });
        this.wireframeMesh = new THREE.LineSegments(edges, this.wireframeMaterial);
        this.wireframeMesh.userData = { isPlaceholder: true, artifactId: this.artifactId, placeholder: this };
        this.group.add(this.wireframeMesh);

        // 3. HTML Badge neo theo toạ độ 3D (CSS2DObject - Chuẩn Sketchfab & Matterport)
        this.domElement = document.createElement('div');
        this.domElement.className = 'select-none pointer-events-auto flex flex-col items-center';
        this.root = createRoot(this.domElement);
        this.renderCard();

        this.cssObject = new CSS2DObject(this.domElement);
        this.cssObject.position.set(0, size * 0.5 + 0.85, 0);
        this.group.add(this.cssObject);

        this.parent.add(this.group);
    }

    private renderCard(): void {
        this.root.render(
            React.createElement(ArtifactPlaceholderCard, {
                artifactName: this.artifactName,
                percent: this.currentPct,
                isWarning: this.isWarning,
                onRetry: this.onRetry,
            })
        );
    }

    public updateProgress(percent: number): void {
        if (this.isWarning) return;
        this.currentPct = percent;
        this.renderCard();
    }

    public setWarningState(): void {
        this.isWarning = true;

        // Chuyển khối lập phương sang màu hổ phách / cam phát sáng cảnh báo trên GPU
        this.cubeMaterial.color.setHex(0xf59e0b);
        this.cubeMaterial.emissive.setHex(0xd97706);
        this.cubeMaterial.emissiveIntensity = 1.1;
        this.cubeMaterial.opacity = 0.75;

        // Khung viền cam nổi bật
        this.wireframeMaterial.color.setHex(0xfbbf24);
        this.wireframeMaterial.opacity = 1.0;

        this.renderCard();
    }

    public setLoadingState(): void {
        this.isWarning = false;
        this.currentPct = 0;

        // Khôi phục màu xanh Cyan neon kiểu Hologram
        this.cubeMaterial.color.setHex(0x00e5ff);
        this.cubeMaterial.emissive.setHex(0x0284c7);
        this.cubeMaterial.emissiveIntensity = 0.8;
        this.cubeMaterial.opacity = 0.55;

        // Khôi phục khung viền xanh sky
        this.wireframeMaterial.color.setHex(0x38bdf8);
        this.wireframeMaterial.opacity = 0.95;

        this.renderCard();
    }

    public update(deltaTime: number): void {
        if (this.isDisposed) return;
        this.elapsedTime += deltaTime;

        // Xử lý hiệu ứng co nhỏ mờ dần khi sắp biến mất để chuyển sang mô hình thật
        if (this.isExiting) {
            this.exitElapsed += deltaTime;
            const exitProgress = Math.min(1, this.exitElapsed / this.exitDuration);
            const currentScale = Math.max(0, 1 - exitProgress);

            this.cubeMesh.scale.set(currentScale, currentScale, currentScale);
            this.wireframeMesh.scale.set(currentScale, currentScale, currentScale);

            this.cubeMaterial.opacity = Math.max(0, (1 - exitProgress) * 0.55);
            this.wireframeMaterial.opacity = Math.max(0, (1 - exitProgress) * 0.95);

            const exitSpin = 3.0 * (1 + exitProgress);
            this.cubeMesh.rotation.y += exitSpin * deltaTime;
            this.wireframeMesh.rotation.y += exitSpin * deltaTime;
            return;
        }

        const rotateSpeed = this.isWarning ? 0.45 : 0.9;
        this.cubeMesh.rotation.y += rotateSpeed * deltaTime;
        this.wireframeMesh.rotation.y += rotateSpeed * deltaTime;
        this.cubeMesh.rotation.x += (rotateSpeed * 0.5) * deltaTime;
        this.wireframeMesh.rotation.x += (rotateSpeed * 0.5) * deltaTime;

        // Hiệu ứng nhấp nhô lơ lửng
        const hoverFreq = this.isWarning ? 3.5 : 2.5;
        const hoverAmp = this.isWarning ? 0.12 : 0.08;
        const hoverOffset = Math.sin(this.elapsedTime * hoverFreq) * hoverAmp;
        this.cubeMesh.position.y = hoverOffset;
        this.wireframeMesh.position.y = hoverOffset;
    }

    public async animateExit(durationMs: number = 200): Promise<void> {
        if (this.isExiting || this.isDisposed) return;
        this.isExiting = true;
        this.exitDuration = Math.max(0.1, durationMs / 1000);
        this.exitElapsed = 0;

        if (this.domElement) {
            this.domElement.style.pointerEvents = 'none';
            this.domElement.style.transition = `all ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            this.domElement.style.opacity = '0';
            this.domElement.style.transform = 'scale(0.7) translateY(10px)';
        }

        await new Promise((resolve) => setTimeout(resolve, durationMs));
        this.dispose();
    }

    public dispose(): void {
        if (this.isDisposed) return;
        this.isDisposed = true;

        this.parent.remove(this.group);

        this.group.remove(this.cssObject);
        this.root.unmount();
        this.domElement.remove();

        this.cubeMesh.geometry.dispose();
        this.cubeMaterial.dispose();

        this.wireframeMesh.geometry.dispose();
        this.wireframeMaterial.dispose();
    }
}
