import * as THREE from 'three';
import { ThreeBehaviour } from '../../../utils/three/ThreeBehaviour';

function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}

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
    private cubeMesh: THREE.Mesh;
    private wireframeMesh: THREE.LineSegments;
    private sprite: THREE.Sprite;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private texture: THREE.CanvasTexture;
    private artifactName: string;
    private scene: THREE.Scene;

    constructor(
        scene: THREE.Scene,
        position: THREE.Vector3,
        artifactName: string,
        size: number = 1.0
    ) {
        this.scene = scene;
        this.artifactName = artifactName;
        this.group = new THREE.Group();
        this.group.position.copy(position);

        // 1. Lõi khối lập phương bán trong suốt kiểu Hologram
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.35,
            roughness: 0.2,
            metalness: 0.8,
        });
        this.cubeMesh = new THREE.Mesh(geometry, material);
        this.group.add(this.cubeMesh);

        // 2. Khung viền wireframe phát sáng
        const edges = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85,
        });
        this.wireframeMesh = new THREE.LineSegments(edges, edgeMaterial);
        this.group.add(this.wireframeMesh);

        // 3. Canvas 2D vẽ tiến trình loading và phần trăm
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 140;
        this.ctx = this.canvas.getContext('2d')!;

        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;

        // 4. Sprite luôn quay về phía Camera (Billboard effect)
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.texture,
            transparent: true,
            depthTest: false,
        });
        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.scale.set(2.8, 0.76, 1);
        this.sprite.position.set(0, size * 0.5 + 0.8, 0);
        this.group.add(this.sprite);

        this.drawCanvas(0);
        this.scene.add(this.group);
    }

    private drawCanvas(percent: number): void {
        const { ctx, canvas } = this;
        const width = canvas.width;
        const height = canvas.height;
        const pct = Math.min(100, Math.max(0, Math.round(percent)));

        ctx.clearRect(0, 0, width, height);

        // Khung nền badge bo tròn
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3;
        drawRoundedRect(ctx, 8, 8, width - 16, height - 16, 20);
        ctx.fill();
        ctx.stroke();

        // Tên hiện vật
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const displayName =
            this.artifactName.length > 18
                ? this.artifactName.slice(0, 18) + '...'
                : this.artifactName;
        ctx.fillText(displayName, 26, 44);

        // Con số phần trăm
        ctx.textAlign = 'right';
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`${pct}%`, width - 26, 44);

        // Thanh tiến trình nền (track)
        const barX = 26;
        const barY = 78;
        const barW = width - 52;
        const barH = 20;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        drawRoundedRect(ctx, barX, barY, barW, barH, 10);
        ctx.fill();

        // Thanh tiến trình đã tải (fill)
        if (pct > 0) {
            const fillW = Math.max(20, (barW * pct) / 100);
            const gradient = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
            gradient.addColorStop(0, '#38bdf8');
            gradient.addColorStop(1, '#818cf8');

            ctx.fillStyle = gradient;
            drawRoundedRect(ctx, barX, barY, fillW, barH, 10);
            ctx.fill();
        }

        this.texture.needsUpdate = true;
    }

    public updateProgress(percent: number): void {
        this.drawCanvas(percent);
    }

    public update(deltaTime: number): void {
        this.cubeMesh.rotation.y += 0.8 * deltaTime;
        this.wireframeMesh.rotation.y += 0.8 * deltaTime;
        this.cubeMesh.rotation.x += 0.4 * deltaTime;
        this.wireframeMesh.rotation.x += 0.4 * deltaTime;
    }

    public dispose(): void {
        this.scene.remove(this.group);

        this.cubeMesh.geometry.dispose();
        (this.cubeMesh.material as THREE.Material).dispose();

        this.wireframeMesh.geometry.dispose();
        (this.wireframeMesh.material as THREE.Material).dispose();

        this.texture.dispose();
        this.sprite.material.dispose();
    }
}
