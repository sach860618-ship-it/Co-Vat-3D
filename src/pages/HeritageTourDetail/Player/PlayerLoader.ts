import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
export const PlayerModelPath = "/models/Animation/student_charactor.glb"

export const PlayerIdleAnimationPath = "/models/Animation/Happy Idle.fbx"

export const PlayerWalkAnimationPath = "/models/Animation/Strut Walking.fbx"

export class PlayerAnimationKey {
    static readonly Idle = "Idle";
    static readonly Walk = "Walk";
}
export class PlayerLoader {
    public loadPlayerModel(
    gltfLoader: GLTFLoader,
    scene: THREE.Scene
): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            PlayerModelPath,
            (gltf) => {
                const player = gltf.scene;

                player.position.set(0, 0, 0);
                player.scale.set(0.04, 0.04, 0.04);
                player.rotation.set(0, 0, 0);

                scene.add(player);

                resolve(player);
            },
            undefined,
            reject
        );
    });
}
    public loadIdleAnimation(
        loader: FBXLoader
    ): Promise<THREE.AnimationClip> {
        return new Promise((resolve, reject) => {
            loader.load(
                PlayerIdleAnimationPath,
                (fbx) => {
                    const clip = fbx.animations[0];

                    resolve(clip);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }
    public loadWalkAnimation(
        loader: FBXLoader
    ): Promise<THREE.AnimationClip> {
        return new Promise((resolve, reject) => {
            loader.load(
                PlayerWalkAnimationPath,
                (fbx) => {
                    const clip = fbx.animations[0];

                    resolve(clip);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }
}