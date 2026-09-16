import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { PlayerAnimationController, PlayerAnimationName } from "./PlayerAnimationController";
import * as THREE from 'three';
import { ExtendCannon } from "../../../../utils/three/CANNON/ExtendCannon";
import * as CANNON from 'cannon-es';
import { CannonBodyAttachObject3D } from "../../../../utils/three/CANNON/CannonBodyAttachObject3D";
import { PlayerStateMachine } from "./StateMachine/PlayerStateMachine";


const playerFbxUrl = new URL('../../src/fbx/Player.fbx', import.meta.url).href;
const atlasTextureUrl = new URL('../../src/fbx/AtlasTexture.png', import.meta.url).href;



export class PlayerController {
    public playerStateMachine = new PlayerStateMachine();
    public playerAnimationController = new PlayerAnimationController();
    public cannonBodyAttachBox = new CannonBodyAttachObject3D();

    public onStart(): void {
        this.playerStateMachine.context.playerController = this;
        this.playerStateMachine.onStart();
        this.playerStateMachine.changeToIdle();
    }

    public clearVelocity(): void {
        if (this.cannonBodyAttachBox.cannonBody == null) {
            return;
        }
        this.cannonBodyAttachBox.cannonBody.velocity.x = 0;
        this.cannonBodyAttachBox.cannonBody.velocity.z = 0;
        this.cannonBodyAttachBox.cannonBody.angularVelocity.set(0, 0, 0);
    }

    public setPrefab(fbx: THREE.Group) {
        this.cannonBodyAttachBox.object3D = fbx;

        // =========================================================
        // Animation
        // =========================================================

        this.playerAnimationController.animationController.createMixer(
            this.cannonBodyAttachBox.object3D
        );

        const idleClip = fbx.animations.find(
            (clip) => clip.name === PlayerAnimationName.Idle
        );

        const walkClip = fbx.animations.find(
            (clip) => clip.name === PlayerAnimationName.Walk
        );

        const sitClip = fbx.animations.find(
            (clip) => clip.name === PlayerAnimationName.Sit
        );

        if (!idleClip) {
            throw new Error(
                `Không tìm thấy animation: ${PlayerAnimationName.Idle} `
            );
        }

        if (!walkClip) {
            throw new Error(
                `Không tìm thấy animation: ${PlayerAnimationName.Walk} `
            );
        }

        if (!sitClip) {
            throw new Error(
                `Không tìm thấy animation: ${PlayerAnimationName.Sit} `
            );
        }

        this.playerAnimationController.animationController.add(
            idleClip,
            PlayerAnimationName.Idle
        );

        this.playerAnimationController.animationController.add(
            walkClip,
            PlayerAnimationName.Walk
        );

        this.playerAnimationController.animationController.add(
            sitClip,
            PlayerAnimationName.Sit
        );

        // =========================================================
        // Transform
        // =========================================================

        // Chuẩn hóa scale (FBX cm sang Three.js m)
        this.cannonBodyAttachBox.object3D.scale.setScalar(0.01);

        this.cannonBodyAttachBox.object3D.position.set(
            0,
            1,
            0
        );

        // =========================================================
        // Shadow
        // =========================================================

        fbx.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        // =========================================================
        // Cannon body
        // =========================================================

        this.cannonBodyAttachBox.offsetPosition.set(
            0,
            0.79,
            0
        );

        this.cannonBodyAttachBox.cannonBody =
            ExtendCannon.createCapsule(0.3, 0.9);

        this.cannonBodyAttachBox.syncRotation = false;

        this.cannonBodyAttachBox.cannonBody.angularFactor.set(
            0,
            0,
            0
        );

        this.cannonBodyAttachBox.cannonBody.position.set(
            0,
            10,
            0
        );

        // =========================================================
        // Texture
        // =========================================================

        const textureLoader = new THREE.TextureLoader();

        const atlasTexture = textureLoader.load(
            atlasTextureUrl
        );

        atlasTexture.colorSpace = THREE.SRGBColorSpace;

        // =========================================================
        // Material
        // =========================================================

        fbx.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) {
                return;
            }

            const mesh = child as THREE.Mesh;

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const convertMaterial = (
                mat: THREE.Material
            ): THREE.Material => {

                if (
                    mesh.name === 'Bellhop' ||
                    mat.name === 'AtlasMaterial'
                ) {
                    return new THREE.MeshStandardMaterial({
                        map: atlasTexture,
                        roughness: 0.7,
                        metalness: 0.0,
                    });
                }

                return new THREE.MeshStandardMaterial({
                    color:
                        (mat as THREE.MeshLambertMaterial).color ||
                        0x111111,
                    roughness: 0.8,
                    metalness: 0.0,
                });
            };

            if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map(
                    convertMaterial
                );
            } else if (mesh.material) {
                mesh.material = convertMaterial(
                    mesh.material
                );
            }
        });
    }

    public async loadAsync(
        loader: FBXLoader,
        onProgress?: (ratio: number) => void
    ): Promise<boolean> {
        try {
            const fbx = await new Promise<THREE.Group>((resolve, reject) => {
                loader.load(
                    playerFbxUrl,
                    (fbx) => resolve(fbx),
                    (progress) => {
                        const total = (progress.lengthComputable && progress.total > 0) ? progress.total : 3375184;
                        const ratio = Math.min(progress.loaded / total, 1);
                        onProgress?.(ratio);
                    },
                    (error) => reject(error)
                );
            });

            // =========================================================
            // Player model
            // =========================================================



            console.log('Player FBX loaded successfully');
            return true;
        } catch (error) {
            console.error(
                'Lỗi khi tải Player.fbx:',
                error
            );
            return false;
        }
    }
}