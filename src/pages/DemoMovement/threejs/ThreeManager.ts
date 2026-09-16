import { RefObject } from "react";
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { ThreeEnvironment } from "../../../utils/three/ThreeEnvironment";
import { ExtendThreeScene } from "../../../utils/three/ExtendThreeScene";
import { ExtendThreeCamera } from "../../../utils/three/ExtendThreeCamera";
import { ExtendThreeRenderer } from "../../../utils/three/ExtendThreeRenderer";
import { ExtendThreeVector3 } from "../../../utils/three/ExtendThreeVector3";
import CannonDebugger from 'cannon-es-debugger';
import { CannonBodyAttachObject3D } from "../../../utils/three/CANNON/CannonBodyAttachObject3D";
import { ExtendCannon } from "../../../utils/three/CANNON/ExtendCannon";
import { CannonBodyPositionInspector } from "../../../utils/three/CANNON/CannonBodyPositionInspector";
import { PlayerController } from "./Player/PlayerController";
import { Input } from "../../../utils/Unity/Input";
import { Chair } from "./Chair/Chair";
import { KeyboardInputListener } from "./InputListener/KeyboardInputListener";
import { JoystickInputListener } from "./InputListener/JoystickInputListener";
import { ControlMode } from "../components/SettingModal/SettingsModal";
import { ViewMode } from "../model/ViewMode";
import { PerspectiveStateMachine } from "./Perspective/PerspectiveStateMachine";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { ThreeBehaviours } from "../../../utils/three/ThreeBehaviour";
import { ArtifactDisplayManager } from "./Artifact/ArtifactDisplayManager";
import { ArtifactInteractionController } from "./Artifact/ArtifactInteractionController";
import { CulturalDestinationModel, ArtifactModel } from "../../../models/Destination/CulturalDestinationModel";
import { ArtifactInfo } from "../../../models/Artifact";
import { BackgroundAssetStatus } from "./Artifact/types";
import { CannonBehaviour } from "./CannonBehaviour";

export class ThreeManager {
    public containerRef: RefObject<HTMLElement>;
    public canvasContainerRef: RefObject<HTMLDivElement>;

    private animationFrameId: number;
    public environment = new ThreeEnvironment();
    public playerController = new PlayerController();
    private input = new Input();
    private chair = new Chair();
    private keyboardInputListener?: KeyboardInputListener;
    private joystickInputListener?: JoystickInputListener;
    private currentControlMode: ControlMode = 'keyboard';
    public fbxLoader = new FBXLoader();


    public perspectiveStateMachine = new PerspectiveStateMachine();
    public onLockChange?: (isLocked: boolean) => void;

    // Hệ thống Cổ vật & Behaviour
    public behaviours = new ThreeBehaviours();
    public labelRenderer?: CSS2DRenderer;
    public artifactDisplayManager?: ArtifactDisplayManager;
    public artifactInteractionController?: ArtifactInteractionController;
    public onSelectArtifact?: (artifact: ArtifactInfo) => void;
    public onBackgroundAssetStatus?: (status: BackgroundAssetStatus) => void;
    public onProximityChange?: (artifact: ArtifactModel | null, distance: number) => void;

    public cannonBehaviour = new CannonBehaviour();
    private cannonDebugger: { update: () => void };


    private handleResize = (): void => {
        if (!this.containerRef.current || !this.environment?.camera || !this.environment?.renderer) return;
        const width = this.containerRef.current.clientWidth;
        const height = this.containerRef.current.clientHeight;
        this.environment.camera.aspect = width / height;
        this.environment.camera.updateProjectionMatrix();
        this.environment.renderer.setSize(width, height);
        this.labelRenderer?.setSize(width, height);
    };

    private handleBlur = (): void => {
        this.resetMovementInput();
    };

    private handleVisibilityChange = (): void => {
        if (document.hidden) {
            this.resetMovementInput();
        } else {
            // Reset delta clock khi quay lại tab để tránh nhảy frame do tích luỹ thời gian
            this.environment?.clock?.getDelta();
        }
    };

    public resetMovementInput(): void {
        this.input.reset();
        this.joystickInputListener?.reset();
        this.playerController?.clearVelocity();
        this.playerController?.playerStateMachine.changeToIdle();
    };

    public createScene(): void {
        this.environment.scene = ExtendThreeScene.createDefaultScene();
    }
    public createCamera(): void {
        this.environment.camera = ExtendThreeCamera.createDefaultPerspectiveCameraFromRef(this.containerRef);
        this.environment.camera.position.set(0, 3, 5);
    }
    public createRenderer(): void {
        this.environment.renderer = ExtendThreeRenderer.createDefaultRendererFromRef(this.canvasContainerRef);
    }
    public createInput(): void {
        this.input.init();
        this.keyboardInputListener = new KeyboardInputListener(this.input);
        this.joystickInputListener = new JoystickInputListener({
            zone: this.containerRef.current ?? undefined,
            size: 100,
            color: '#c70b0b',
        });
    }
    public createAmbientLight(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.environment.scene.add(ambientLight);
    }


    public createHemiLight(): void {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        hemiLight.position.set(0, 20, 0);
        this.environment.scene.add(hemiLight);
    }

    public createHelpers(): void {
        this.environment.gridHelper = this.environment.createGridHelper(this.environment.scene);
        this.environment.axesHelper = this.environment.createAxesHelper(this.environment.scene);
        this.environment.directionalLight = this.environment.createDirectionalLight(this.environment.scene);
        this.environment.directionalLightHelper = this.environment.createDirectionalLightHelper(this.environment.directionalLight);

        this.cannonDebugger = CannonDebugger(this.environment.scene, this.cannonBehaviour.world, {
            color: 0xff0000,
        });
    }

    public createPhysicWorld(): void {
        this.cannonBehaviour.init();
        this.behaviours.Register(this.cannonBehaviour.root, this.cannonBehaviour.behaviour);
    }

    public createPlane(): void {
        const planeSize = 100;
        const planeThickness = 0.2;

        const plane = this.environment.createDefaultPlane();
        plane.scale.setScalar(planeSize);
        this.environment.scene.add(plane);

        const groundBody = new CANNON.Body({
            mass: 0, // Khối lượng 0 để làm vật thể tĩnh
            shape: new CANNON.Box(new CANNON.Vec3(planeSize / 2, planeThickness / 2, planeSize / 2)),
            position: new CANNON.Vec3(0, -planeThickness / 2, 0),
            type: CANNON.Body.STATIC
        });
        this.cannonBehaviour.world.addBody(groundBody);
    }

    public createChair(): void {
        // 1. Tạo Mesh và Physics Body cho ghế từ các khối Box
        const charResponse = this.chair.createDisplay();
        this.chair.cannonBodyAttachBox.object3D = charResponse.object3D;
        this.chair.cannonBodyAttachBox.cannonBody = charResponse.cannonBody;
        this.chair.cannonBodyAttachBox.cannonBody.position.set(2, 0, 2);


        this.environment.scene.add(this.chair.cannonBodyAttachBox.object3D);
        this.cannonBehaviour.world.addBody(this.chair.cannonBodyAttachBox.cannonBody);
    }

    public OnStart(): void {


        this.playerController.playerStateMachine.context.input = this.input;
        this.setControlMode(this.currentControlMode);

        this.playerController.playerStateMachine.context.camera = this.environment.camera;

        // Mount canvas vào DOM
        if (this.canvasContainerRef.current) {
            this.canvasContainerRef.current.innerHTML = '';
            this.canvasContainerRef.current.appendChild(this.environment.renderer.domElement);
        }

        const width = this.containerRef.current?.clientWidth || window.innerWidth;
        const height = this.containerRef.current?.clientHeight || window.innerHeight;

        // Khởi tạo CSS2DRenderer cho các thẻ HTML 3D bám vị trí trong không gian
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(width, height);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.left = '0px';
        this.labelRenderer.domElement.style.width = '100%';
        this.labelRenderer.domElement.style.height = '100%';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.labelRenderer.domElement.style.zIndex = '10';
        if (this.canvasContainerRef.current) {
            this.canvasContainerRef.current.appendChild(this.labelRenderer.domElement);
        }


        // Ánh sáng môi trường hiển thị rõ vật liệu model


        // Khởi tạo Perspective State Machine
        if (this.environment.camera && this.environment.renderer?.domElement) {
            this.perspectiveStateMachine.init(
                {
                    camera: this.environment.camera as THREE.PerspectiveCamera,
                    domElement: this.environment.renderer.domElement,
                    playerController: this.playerController,
                    onLockChange: (locked) => this.onLockChange?.(locked),
                    firstPersonEyeOffset: new THREE.Vector3(0, 1.55, 0),
                    cameraTargetOffset: new THREE.Vector3(0, 1.2, 0),
                    cameraFollowSpeed: 6,
                    currentControlMode: this.currentControlMode,
                },
                this.perspectiveStateMachine.getCurrentViewMode()
            );
        }



        // Khởi tạo ArtifactDisplayManager & ArtifactInteractionController
        this.artifactDisplayManager = new ArtifactDisplayManager(
            this.environment.scene,
            this.cannonBehaviour.world,
            this.behaviours,
            {
                onBackgroundAssetStatus: (status) => this.onBackgroundAssetStatus?.(status),
            }
        );

        this.artifactInteractionController = new ArtifactInteractionController(
            this.canvasContainerRef.current || this.containerRef.current || document.body,
            this.environment.camera,
            this.artifactDisplayManager,
            {
                onSelectArtifact: (art) => this.onSelectArtifact?.(art),
                onProximityChange: (art, dist) => this.onProximityChange?.(art, dist),
            }
        );






        const animate = (): void => {
            this.animationFrameId = requestAnimationFrame(animate);

            // 1. Chỉ gọi getDelta() 1 lần duy nhất đầu frame
            const delta = Math.min(this.environment.clock.getDelta(), 0.1);

            this.playerController?.playerAnimationController?.animationController?.update(delta);
            this.playerController?.playerStateMachine?.stateMachine?.Update(delta);
            this.playerController?.cannonBodyAttachBox?.onUpdate();

            // 3. Bước vật lý đồng bộ trực tiếp theo frame delta để chuyển động mượt mà (tránh accumulator jitter)


            // 5. Cập nhật góc nhìn qua Perspective State Machine
            this.perspectiveStateMachine.update(delta);

            // 6. Cập nhật các behaviour Three.js (Hologram, xoay bục, hiệu ứng xuất hiện cổ vật)
            this.behaviours.Update(delta);


            this.cannonDebugger.update();

            this.environment.renderer.render(this.environment.scene, this.environment.camera);
            this.labelRenderer?.render(this.environment.scene, this.environment.camera);
            this.chair.cannonBodyAttachBox.onUpdate();

            this.input.update();
        };

        animate();

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('blur', this.handleBlur);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    public async loadDestinationArtifacts(destination: CulturalDestinationModel): Promise<void> {
        await this.artifactDisplayManager?.loadDestination(destination);
    }

    public setViewMode(mode: ViewMode): void {
        this.perspectiveStateMachine.setViewMode(mode);
    }

    public requestPointerLock(): void {
        this.perspectiveStateMachine.requestPointerLock();
    }

    public unlockPointer(): void {
        this.perspectiveStateMachine.unlockPointer();
    }

    public setControlMode(mode: ControlMode): void {
        this.currentControlMode = mode;
        this.perspectiveStateMachine.setControlMode(mode);
        if (mode === 'keyboard') {
            this.joystickInputListener?.hide();
            if (this.keyboardInputListener) {
                this.playerController.playerStateMachine.context.inputListener.clear();
                this.playerController.playerStateMachine.context.inputListener.setKeyboardInputListener(this.keyboardInputListener);
            }
        } else if (mode === 'joystick') {
            this.joystickInputListener?.show();
            if (this.joystickInputListener) {
                this.playerController.playerStateMachine.context.inputListener.clear();
                this.playerController.playerStateMachine.context.inputListener.setJoystickInputListener(this.joystickInputListener);
            }
        }
    }

    public OnDestroy(): void {
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('blur', this.handleBlur);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        this.artifactInteractionController?.dispose();
        this.artifactDisplayManager?.dispose();
        this.behaviours.Clear();

        this.perspectiveStateMachine.dispose();

        this.environment?.renderer?.dispose();
        this.joystickInputListener?.destroy();
        this.input?.destroy();

        if (this.labelRenderer?.domElement?.parentElement) {
            this.labelRenderer.domElement.parentElement.removeChild(this.labelRenderer.domElement);
        }

        if (this.playerController?.cannonBodyAttachBox?.object3D && this.environment?.scene) {
            this.environment.scene.remove(this.playerController.cannonBodyAttachBox.object3D);
        }

        if (this.chair.cannonBodyAttachBox.object3D && this.environment?.scene) {
            this.environment.scene.remove(this.chair.cannonBodyAttachBox.object3D);
        }

        if (this.canvasContainerRef.current && this.environment?.renderer?.domElement) {
            if (this.canvasContainerRef.current.contains(this.environment.renderer.domElement)) {
                this.canvasContainerRef.current.removeChild(this.environment.renderer.domElement);
            }
        }
    }
}
