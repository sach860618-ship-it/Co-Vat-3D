// #region loadModelAsync
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadModelAsyncOptions {
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Vector3;
    parent: THREE.Object3D;
    onProgress: (event: ProgressEvent<EventTarget>) => void;
    onBeforeAdd: (model: THREE.Object3D, gltf: GLTF) => void;
}

export function loadModelAsync(
    loader: GLTFLoader,
    modelUrl: string,
    options: LoadModelAsyncOptions
): Promise<GLTF> {
    return new Promise<GLTF>((resolve, reject) => {
        loader.load(
            encodeURI(modelUrl),
            (gltf: GLTF) => {
                const model = gltf.scene;

                if (options?.position) model.position.copy(options.position);
                if (options?.scale) model.scale.copy(options.scale);
                if (options?.rotation) {
                    model.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
                }

                options?.onBeforeAdd?.(model, gltf);

                if (options?.parent) {
                    options.parent.add(model);
                }

                resolve(gltf);
            },
            (event: ProgressEvent<EventTarget>) => {
                options?.onProgress?.(event);
            },
            (error: unknown) => {
                console.warn(`[loadModelAsync] Lỗi tải tài nguyên từ: ${modelUrl}`, error);
                reject(error);
            }
        );
    });
}
// #endregion