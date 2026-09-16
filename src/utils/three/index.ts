import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Cấu hình bắt buộc khi chuẩn hoá kích thước và toạ độ mô hình 3D.
 */
export interface NormalizeModelOptions {
    targetSize: number;
    scaleMultiplier: number;
    centerOnGround: boolean;
    groundOffsetY: number;
}

/**
 * Xử lý cập nhật tỉ lệ khung nhìn Camera và kích thước WebGLRenderer khi resize.
 */
export function handleWindowResize(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    container: HTMLElement
): void {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Chuẩn hoá kích thước Bounding Box và căn chỉnh toạ độ tâm của mô hình Object3D.
 */
export function normalizeModelBounds(
    model: THREE.Object3D,
    options: NormalizeModelOptions
): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = options.scaleMultiplier * (options.targetSize / (maxDim || 1));
    model.scale.setScalar(targetScale);

    const center = box.getCenter(new THREE.Vector3());
    model.position.x = -center.x * targetScale;
    if (options.centerOnGround) {
        model.position.y = options.groundOffsetY - box.min.y * targetScale;
    } else {
        model.position.y = -center.y * targetScale;
    }
    model.position.z = -center.z * targetScale;
}

/**
 * Bật/tắt đổ bóng đệ quy cho toàn bộ Mesh trong cây đối tượng Object3D.
 */
export function enableShadows(
    object: THREE.Object3D,
    cast: boolean,
    receive: boolean
): void {
    object.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = cast;
            child.receiveShadow = receive;
        }
    });
}

/**
 * Ánh xạ và chuẩn hoá tên track animation từ file FBX (Mixamo) khớp với khung xương GLTF.
 */
export function retargetMixamoFBXAnimation(
    clip: THREE.AnimationClip,
    boneNames: Set<string>
): void {
    clip.tracks.forEach((track) => {
        const parts = track.name.split('.');
        const rawBone = parts[0];
        const property = parts[1];

        let targetBone = rawBone;
        if (!boneNames.has(rawBone)) {
            const cleanName = rawBone.replace(/^mixamorig:?/, '');
            for (const bName of boneNames) {
                if (bName === cleanName || bName.replace(/^mixamorig:?/, '') === cleanName) {
                    targetBone = bName;
                    break;
                }
            }
        }
        track.name = `${targetBone}.${property}`;
    });
}

/**
 * Tính toán vector di chuyển chuẩn hoá trên mặt phẳng ngang XZ tương đối theo hướng nhìn Camera.
 */
export function calculateCameraRelativeDirection(
    camera: THREE.Camera,
    moveZ: number,
    moveX: number
): THREE.Vector3 {
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    if (cameraForward.lengthSq() > 0.0001) {
        cameraForward.normalize();
    } else {
        cameraForward.set(0, 0, -1);
    }

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();

    return new THREE.Vector3()
        .addScaledVector(cameraForward, moveZ)
        .addScaledVector(cameraRight, moveX)
        .normalize();
}

/**
 * Xoay góc hiện tại tiến về góc đích mượt mà theo cung ngắn nhất (-PI đến PI).
 */
export function smoothRotateTowards(
    currentAngle: number,
    targetAngle: number,
    maxStep: number
): number {
    let angleDiff = targetAngle - currentAngle;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    return currentAngle + THREE.MathUtils.clamp(angleDiff, -maxStep, maxStep);
}

/**
 * Tính toạ độ chuẩn hoá NDC (-1 đến +1) cho Raycaster từ sự kiện chuột và vùng chứa DOM.
 */
export function getNormalizedPointer(
    event: MouseEvent,
    container: HTMLElement
): THREE.Vector2 {
    const rect = container.getBoundingClientRect();
    return new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
}

/**
 * Giải phóng triệt để tài nguyên GPU (geometries, materials, textures) của cây đối tượng Three.js.
 */
export function disposeHierarchy(
    root: THREE.Object3D
): void {
    root.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) {
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => {
                        disposeMaterial(mat);
                    });
                } else {
                    disposeMaterial(mesh.material);
                }
            }
        }
    });
}

/**
 * Giải phóng một material và các texture đính kèm bên trong.
 */
function disposeMaterial(mat: THREE.Material): void {
    mat.dispose();
    for (const key of Object.keys(mat)) {
        const value = (mat as unknown as Record<string, unknown>)[key];
        if (value && typeof value === 'object' && 'isTexture' in value && (value as THREE.Texture).isTexture) {
            (value as THREE.Texture).dispose();
        }
    }
}

export * from './SmoothFollowerBehaviour';
export * from './ThirdPersonOrbitBehaviour';
export * from './Utils/LoadModelUtils';