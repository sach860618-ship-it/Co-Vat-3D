import * as THREE from 'three';
import { ArtifactInfo } from '../../../../models/Artifact';
import { ArtifactModel } from '../../../../models/Destination/CulturalDestinationModel';
import { ArtifactDisplayManager } from './ArtifactDisplayManager';
import { getNormalizedPointer } from '../../../../utils/three';

export interface ArtifactInteractionEvents {
    onSelectArtifact?: (artifact: ArtifactInfo) => void;
    onProximityChange?: (artifact: ArtifactModel | null, distance: number) => void;
}

export class ArtifactInteractionController {
    private container: HTMLElement;
    private camera: THREE.Camera;
    private displayManager: ArtifactDisplayManager;
    private events: ArtifactInteractionEvents;

    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private pointerDownPos = { x: 0, y: 0 };
    private currentProximityArtifact: ArtifactModel | null = null;

    public static readonly PROXIMITY_DISTANCE = 2.8;

    constructor(
        container: HTMLElement,
        camera: THREE.Camera,
        displayManager: ArtifactDisplayManager,
        events: ArtifactInteractionEvents = {}
    ) {
        this.container = container;
        this.camera = camera;
        this.displayManager = displayManager;
        this.events = events;

        this.bindEvents();
    }

    private bindEvents(): void {
        window.addEventListener('keydown', this.handleKeyDown);
        this.container.addEventListener('pointerdown', this.handlePointerDown);
        this.container.addEventListener('pointermove', this.handlePointerMove);
        this.container.addEventListener('click', this.handleClick);
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        if (e.code === 'KeyE') {
            if (this.currentProximityArtifact) {
                this.events.onSelectArtifact?.(this.currentProximityArtifact.artifact);
            }
        }
    };

    private handlePointerDown = (e: MouseEvent): void => {
        this.pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    private handlePointerMove = (e: MouseEvent): void => {
        const pointer = getNormalizedPointer(e, this.container);
        this.mouse.x = pointer.x;
        this.mouse.y = pointer.y;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 1. Kiểm tra placeholder lỗi
        const warningPlaceholders = Array.from(this.displayManager.placeholders.values()).filter((p) => p.isWarning);
        if (warningPlaceholders.length > 0) {
            const warningGroups = warningPlaceholders.map((p) => p.group);
            const warningHits = this.raycaster.intersectObjects(warningGroups, true);
            if (warningHits.length > 0) {
                document.body.style.cursor = 'pointer';
                return;
            }
        }

        // 2. Kiểm tra cổ vật đang tương tác
        if (this.displayManager.interactiveArtifacts.length > 0) {
            const hits = this.raycaster.intersectObjects(this.displayManager.interactiveArtifacts, true);
            if (hits.length > 0) {
                document.body.style.cursor = 'pointer';
                return;
            }
        }

        document.body.style.cursor = 'default';
    };

    private handleClick = (e: MouseEvent): void => {
        // Bỏ qua nếu là thao tác kéo xoay chuột (> 6px)
        const dragDistance = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
        if (dragDistance > 6) return;

        const pointer = getNormalizedPointer(e, this.container);
        this.mouse.x = pointer.x;
        this.mouse.y = pointer.y;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 1. Click vào placeholder lỗi để retry tải lại
        const warningPlaceholders = Array.from(this.displayManager.placeholders.values()).filter((p) => p.isWarning);
        if (warningPlaceholders.length > 0) {
            const warningGroups = warningPlaceholders.map((p) => p.group);
            const warningHits = this.raycaster.intersectObjects(warningGroups, true);
            if (warningHits.length > 0) {
                let curr: THREE.Object3D | null = warningHits[0].object;
                let targetArtifactId: string | null = null;
                while (curr) {
                    if (curr.userData?.isPlaceholder && curr.userData?.artifactId) {
                        targetArtifactId = curr.userData.artifactId;
                        break;
                    }
                    curr = curr.parent;
                }
                if (targetArtifactId) {
                    const placeholder = this.displayManager.placeholders.get(targetArtifactId);
                    if (placeholder) {
                        const targetPlacement = this.findPlacementById(targetArtifactId);
                        if (targetPlacement) {
                            this.displayManager.retry(targetPlacement);
                            return;
                        }
                    }
                }
            }
        }

        // 2. Click vào cổ vật trưng bày -> mở modal chi tiết
        if (this.displayManager.interactiveArtifacts.length > 0) {
            const hits = this.raycaster.intersectObjects(this.displayManager.interactiveArtifacts, true);
            if (hits.length > 0) {
                let curr: THREE.Object3D | null = hits[0].object;
                while (curr) {
                    if (curr.userData?.isArtifact && curr.userData?.artifact) {
                        this.events.onSelectArtifact?.(curr.userData.artifact);
                        return;
                    }
                    curr = curr.parent;
                }
            }
        }
    };

    private findPlacementById(id: string): ArtifactModel | undefined {
        for (const obj of this.displayManager.interactiveArtifacts) {
            if (obj.userData?.artifactId === id) {
                return obj.userData.placement;
            }
        }
        return undefined;
    }

    public update(playerPos?: THREE.Vector3): void {
        if (!playerPos) return;

        let closestPlacement: ArtifactModel | null = null;
        let minDistance = Infinity;

        // Quét khoảng cách từ player tới các cổ vật đã nạp
        for (const obj of this.displayManager.interactiveArtifacts) {
            const placement: ArtifactModel | undefined = obj.userData?.placement;
            if (!placement) continue;

            const dx = playerPos.x - placement.position.x;
            const dz = playerPos.z - placement.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist < minDistance) {
                minDistance = dist;
                closestPlacement = placement;
            }
        }

        if (minDistance <= ArtifactInteractionController.PROXIMITY_DISTANCE && closestPlacement) {
            if (this.currentProximityArtifact?.id !== closestPlacement.id) {
                this.currentProximityArtifact = closestPlacement;
                this.events.onProximityChange?.(closestPlacement, minDistance);
            }
        } else {
            if (this.currentProximityArtifact !== null) {
                this.currentProximityArtifact = null;
                this.events.onProximityChange?.(null, minDistance);
            }
        }
    }

    public dispose(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.container.removeEventListener('pointerdown', this.handlePointerDown);
        this.container.removeEventListener('pointermove', this.handlePointerMove);
        this.container.removeEventListener('click', this.handleClick);
        document.body.style.cursor = 'default';
        this.currentProximityArtifact = null;
    }
}
