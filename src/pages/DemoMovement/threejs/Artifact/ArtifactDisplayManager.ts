import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CulturalDestinationModel, ArtifactModel } from '../../../../models/Destination/CulturalDestinationModel';
import { loadModelAsync } from '../../../../utils/three';
import { ThreeBehaviours } from '../../../../utils/three/ThreeBehaviour';
import { ArtifactRotateBehaviour } from './ArtifactRotateBehaviour';
import { ArtifactSpawnBehaviour } from './ArtifactSpawnBehaviour';
import {
    ArtifactLoadingPlaceholder,
    PlaceholderRotateBehaviour,
} from './ArtifactLoadingPlaceholder';
import { BackgroundAssetStatus } from './types';
import { AsyncOperationHandler } from '../../../../utils/async/AsyncOperationHandler';

export interface ArtifactDisplayEvents {
    onBackgroundAssetStatus?: (status: BackgroundAssetStatus) => void;
}

export class ArtifactDisplayManager {
    public rootGroup: THREE.Group;
    public pedestalsGroup: THREE.Group;
    public artifactsGroup: THREE.Group;
    public interactiveArtifacts: THREE.Object3D[] = [];
    public placeholders = new Map<string, ArtifactLoadingPlaceholder>();

    private scene: THREE.Scene;
    private world: CANNON.World;
    private behaviours: ThreeBehaviours;
    private events: ArtifactDisplayEvents;

    private bgGltfLoader = new GLTFLoader();
    private activeHandlers = new Map<string, AsyncOperationHandler<ArtifactModel, GLTF>>();
    private pedestalBodies: CANNON.Body[] = [];
    private currentDestination?: CulturalDestinationModel;

    private isDisposed = false;
    private total = 0;
    private loadedCount = 0;
    private failedCount = 0;
    private activeLoadingNames = new Set<string>();

    public static readonly PEDESTAL_HEIGHT = 0.9;
    public static readonly PEDESTAL_RADIUS = 0.6;

    constructor(
        scene: THREE.Scene,
        world: CANNON.World,
        behaviours: ThreeBehaviours,
        events: ArtifactDisplayEvents = {}
    ) {
        this.scene = scene;
        this.world = world;
        this.behaviours = behaviours;
        this.events = events;

        this.rootGroup = new THREE.Group();
        this.rootGroup.name = "ArtifactsRoot";

        this.pedestalsGroup = new THREE.Group();
        this.pedestalsGroup.name = "PedestalsGroup";

        this.artifactsGroup = new THREE.Group();
        this.artifactsGroup.name = "ArtifactsModelsGroup";

        this.rootGroup.add(this.pedestalsGroup);
        this.rootGroup.add(this.artifactsGroup);
        this.scene.add(this.rootGroup);
    }

    public async loadDestination(destination: CulturalDestinationModel): Promise<void> {
        this.clear();
        this.currentDestination = destination;
        const artifacts = destination.artifacts || [];
        this.total = artifacts.length;
        this.loadedCount = 0;
        this.failedCount = 0;

        if (this.total === 0) {
            this.emitStatus();
            return;
        }

        // 1. Tạo bục trưng bày (Pedestals) và Placeholders cho từng cổ vật
        artifacts.forEach((placement) => {
            const posX = placement.position.x;
            const posZ = placement.position.z;

            // Bục trưng bày vật lý
            this.createPedestal(posX, posZ, placement.color);

            // Placeholder hiển thị trạng thái tải
            const placeholder = new ArtifactLoadingPlaceholder(
                this.artifactsGroup,
                new THREE.Vector3(posX, ArtifactDisplayManager.PEDESTAL_HEIGHT, posZ),
                placement.name,
                1.0,
                placement.id,
                () => this.retry(placement)
            );
            const rotateBehaviour = new PlaceholderRotateBehaviour(placeholder);
            this.behaviours.Register(placeholder.group, rotateBehaviour);
            this.placeholders.set(placement.id, placeholder);
        });

        this.emitStatus();

        // 2. Bắt đầu tải ngầm các mô hình cổ vật theo queue
        await this.loadAll(artifacts);
    }

    private createPedestal(x: number, z: number, accentColor: number = 0x38bdf8): void {
        const height = ArtifactDisplayManager.PEDESTAL_HEIGHT;
        const radius = ArtifactDisplayManager.PEDESTAL_RADIUS;

        const pedestalGroup = new THREE.Group();
        pedestalGroup.position.set(x, 0, z);

        // Vật liệu bục đá cẩm thạch tối màu
        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x1c2128,
            roughness: 0.35,
            metalness: 0.65,
        });

        // 1. Chân đế rộng
        const baseGeom = new THREE.CylinderGeometry(radius * 1.15, radius * 1.25, 0.08, 32);
        const baseMesh = new THREE.Mesh(baseGeom, darkMaterial);
        baseMesh.position.y = 0.04;
        baseMesh.receiveShadow = true;
        baseMesh.castShadow = true;
        pedestalGroup.add(baseMesh);

        // 2. Thân trụ bục
        const bodyGeom = new THREE.CylinderGeometry(radius, radius, height - 0.14, 32);
        const bodyMesh = new THREE.Mesh(bodyGeom, darkMaterial);
        bodyMesh.position.y = (height - 0.14) / 2 + 0.08;
        bodyMesh.receiveShadow = true;
        bodyMesh.castShadow = true;
        pedestalGroup.add(bodyMesh);

        // 3. Mặt bục trên cùng
        const topGeom = new THREE.CylinderGeometry(radius * 1.08, radius, 0.06, 32);
        const topMesh = new THREE.Mesh(topGeom, darkMaterial);
        topMesh.position.y = height - 0.03;
        topMesh.receiveShadow = true;
        topMesh.castShadow = true;
        pedestalGroup.add(topMesh);

        // 4. Vòng LED phát quang viền trên mặt bục
        const ringGeom = new THREE.RingGeometry(radius * 0.95, radius * 1.05, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: accentColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = height + 0.002;
        pedestalGroup.add(ringMesh);

        // 5. Đèn rọi điểm (Spotlight) dịu chiếu từ trên bục
        const spotLight = new THREE.SpotLight(accentColor, 1.8, 6, Math.PI / 4, 0.45, 1.5);
        spotLight.position.set(0, 3.5, 0);
        spotLight.target.position.set(0, height, 0);
        pedestalGroup.add(spotLight);
        pedestalGroup.add(spotLight.target);

        this.pedestalsGroup.add(pedestalGroup);

        // 6. Tạo Cannon Static Body chặn nhân vật
        const cannonBody = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(x, height / 2, z),
            shape: new CANNON.Cylinder(radius * 1.05, radius * 1.05, height, 16),
        });
        this.world.addBody(cannonBody);
        this.pedestalBodies.push(cannonBody);
    }

    private formatActiveNames(): string {
        const names = Array.from(this.activeLoadingNames);
        if (names.length === 0) return '';
        if (names.length > 2) return `${names.slice(0, 2).join(', ')} (+${names.length - 2})`;
        return names.join(', ');
    }

    private emitStatus(): void {
        this.events.onBackgroundAssetStatus?.({
            total: this.total,
            loaded: this.loadedCount,
            failed: this.failedCount,
            currentName: this.formatActiveNames(),
            isComplete: (this.loadedCount + this.failedCount) >= this.total,
        });
    }

    private async loadAll(artifacts: ArtifactModel[]): Promise<void> {
        if (!artifacts || artifacts.length === 0) return;

        const concurrencyLimit = Math.min(3, artifacts.length);
        const queue = [...artifacts];

        const workers = Array.from({ length: concurrencyLimit }, async () => {
            while (queue.length > 0 && !this.isDisposed) {
                const item = queue.shift();
                if (item) {
                    await this.loadSingleArtifact(item);
                }
            }
        });

        await Promise.allSettled(workers);
    }

    private createArtifactHandler(artifact: ArtifactModel): AsyncOperationHandler<ArtifactModel, GLTF> {
        const handler = new AsyncOperationHandler<ArtifactModel, GLTF>();
        const placeholder = this.placeholders.get(artifact.id);

        let stopProgress = false;
        let currentPct = 0;

        const simulateProgress = async (durationMs: number, signal: AbortSignal) => {
            const progressStartTime = performance.now();
            while (!stopProgress && !this.isDisposed && !signal.aborted && this.placeholders.has(artifact.id)) {
                const elapsed = performance.now() - progressStartTime;
                const targetPct = Math.min(95, Math.round((elapsed / durationMs) * 100));
                if (targetPct > currentPct) {
                    currentPct = targetPct;
                    placeholder?.updateProgress(currentPct);
                }
                if (currentPct >= 95) break;
                await new Promise((r) => setTimeout(r, 50));
            }
        };

        handler.onBeforeRequestAction = () => {
            this.activeLoadingNames.add(artifact.name);
            this.emitStatus();
        };

        handler.requestFunc = async (item, signal) => {
            const loadStartTime = performance.now();
            const MIN_DELAY_MS = 500;

            try {
                const [gltf] = await Promise.all([
                    loadModelAsync(this.bgGltfLoader, item.getModelUrl(), {
                        position: new THREE.Vector3(
                            item.position.x,
                            ArtifactDisplayManager.PEDESTAL_HEIGHT + 0.05,
                            item.position.z
                        ),
                        scale: item.scale,
                        rotation: item.rotation,
                        parent: null,
                        onBeforeAdd: null,
                        onProgress: null,
                    }),
                    simulateProgress(2000, signal),
                ]);

                return gltf;
            } catch (err) {
                const elapsed = performance.now() - loadStartTime;
                if (elapsed < MIN_DELAY_MS) {
                    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS - elapsed));
                }
                throw err;
            }
        };

        handler.onSuccessAction = async (gltf) => {
            stopProgress = true;
            if (this.isDisposed) return;

            placeholder?.updateProgress(100);

            if (placeholder) {
                await placeholder.animateExit(200);
                this.placeholders.delete(artifact.id);
                this.behaviours.Remove(placeholder.group);
            }

            if (this.isDisposed) return;

            this.spawnArtifactModel(artifact, gltf.scene);
        };

        handler.onFailureAction = (err) => {
            stopProgress = true;
            console.warn(`Lỗi nạp mô hình cổ vật ${artifact.name}:`, err);
            if (placeholder && !this.isDisposed) {
                placeholder.setWarningState();
            }
            this.failedCount++;
        };

        handler.onFinallyAction = () => {
            stopProgress = true;
            this.activeLoadingNames.delete(artifact.name);
            this.activeHandlers.delete(artifact.id);
            if (!this.isDisposed) {
                this.emitStatus();
            }
        };

        return handler;
    }

    private async loadSingleArtifact(artifact: ArtifactModel): Promise<void> {
        if (this.isDisposed) return;
        const handler = this.createArtifactHandler(artifact);
        this.activeHandlers.set(artifact.id, handler);
        await handler.executeAsync(artifact);
    }

    private spawnArtifactModel(artifact: ArtifactModel, gltfScene: THREE.Group): void {
        if (this.isDisposed) return;

        const model = gltfScene;
        // Đặt toạ độ hiển thị trên mặt bục
        model.position.set(
            artifact.position.x,
            ArtifactDisplayManager.PEDESTAL_HEIGHT + 0.05,
            artifact.position.z
        );
        model.scale.set(0.001, 0.001, 0.001);

        const metadata = {
            isArtifact: true,
            artifact: artifact.artifact,
            placement: artifact,
            artifactId: artifact.id,
            pedestalPosition: new THREE.Vector3(artifact.position.x, 0, artifact.position.z),
        };

        model.userData = metadata;
        model.traverse((child) => {
            child.userData = metadata;
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Hiệu ứng xuất hiện scale nảy nhẹ
        const spawnBehaviour = new ArtifactSpawnBehaviour(
            artifact.scale,
            0.65,
            this.artifactsGroup,
            () => {
                if (!this.isDisposed) {
                    this.behaviours.Remove(model);
                    // Xoay nhẹ tại chỗ tạo cảm giác chuyển động sống động
                    const rotateBehaviour = new ArtifactRotateBehaviour(new THREE.Vector3(0, 0.35, 0));
                    this.behaviours.Register(model, rotateBehaviour);
                }
            }
        );
        this.behaviours.Register(model, spawnBehaviour);
        this.artifactsGroup.add(model);

        this.interactiveArtifacts.push(model);
        this.loadedCount++;
    }

    public async retry(artifact: ArtifactModel): Promise<void> {
        if (this.isDisposed) return;
        const placeholder = this.placeholders.get(artifact.id);
        if (!placeholder || !placeholder.isWarning) return;

        placeholder.setLoadingState();
        if (this.failedCount > 0) this.failedCount--;

        const handler = this.createArtifactHandler(artifact);
        this.activeHandlers.set(artifact.id, handler);
        await handler.executeAsync(artifact);
    }

    public clear(): void {
        this.activeHandlers.forEach((h) => h.cancel());
        this.activeHandlers.clear();

        this.placeholders.forEach((placeholder) => {
            this.behaviours.Remove(placeholder.group);
            placeholder.dispose();
        });
        this.placeholders.clear();

        this.interactiveArtifacts.forEach((model) => {
            this.behaviours.Remove(model);
        });
        this.interactiveArtifacts = [];

        // Dọn dẹp physics bodies của bục
        this.pedestalBodies.forEach((body) => {
            this.world.removeBody(body);
        });
        this.pedestalBodies = [];

        // Clear Three.js meshes
        this.disposeGroupChildren(this.pedestalsGroup);
        this.disposeGroupChildren(this.artifactsGroup);
        this.pedestalsGroup.clear();
        this.artifactsGroup.clear();

        this.activeLoadingNames.clear();
        this.loadedCount = 0;
        this.failedCount = 0;
        this.total = 0;
    }

    private disposeGroupChildren(group: THREE.Group): void {
        group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.geometry?.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((m) => m.dispose());
                } else if (mesh.material) {
                    mesh.material.dispose();
                }
            }
        });
    }

    public dispose(): void {
        this.isDisposed = true;
        this.clear();
        if (this.rootGroup.parent) {
            this.rootGroup.parent.remove(this.rootGroup);
        }
    }
}
