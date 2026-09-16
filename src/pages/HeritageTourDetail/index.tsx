import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import culturalDestinationsData, { ArtifactModel } from '../../models/Destination/CulturalDestinationModel';

// Các sub-component giao diện hiển thị lớp overlay trên không gian 3D
import { DestinationInfoDrawer } from './components/DestinationInfoDrawer';
import { TourInteractionGuide } from './components/TourInteractionGuide';
import { LightingControlPanel, LIGHT_PRESETS } from './components/LightingControlPanel';
import { SceneLoadingOverlay } from './components/SceneLoadingOverlay';
import { TourNavigationBadge } from './components/TourNavigationBadge';
import { TourActionToolbar } from './components/TourActionToolbar';
import { ArtifactDetailModal } from './components/ArtifactDetailModal';
import { HeritageNotFound } from './components/HeritageNotFound';

// Các thư viện và module chuyên biệt của Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
    handleWindowResize,
    disposeHierarchy,
    loadModel,
    loadModelAsync,
    getNormalizedPointer,
    ThirdPersonOrbitBehaviour,
    FpsTracker,
} from '../../utils/three';
import { ArtifactLoadingBadge, BackgroundAssetStatus } from './Artifact/ArtifactLoadingBadge';
import { ExtendThreeCamera } from '../../utils/three/ExtendThreeCamera';
import { ThreeEnvironment } from '../../utils/three/ThreeEnvironment';
import { ExtendThreeScene } from '../../utils/three/ExtendThreeScene';
import { ExtendThreeRenderer } from '../../utils/three/ExtendThreeRenderer';
import { ThreeBehaviours } from '../../utils/three/ThreeBehaviour';
import { ArtifactRotateBehaviour } from './Artifact/ArtifactRotateBehaviour';
import {
    ArtifactLoadingPlaceholder,
    PlaceholderRotateBehaviour,
} from './Artifact/ArtifactLoadingPlaceholder';
import { PlayerAnimationKey, PlayerLoader } from './Player/PlayerLoader';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { ThreeAnimation } from '../../utils/three/ThreeAnimation';
import { PlayerMovementBehaviour } from './Player/PlayerMovementBehaviour';
import { ColliderManager } from './Collision/ColliderManager';
import { CannonPhysicsManager } from './Physics/CannonPhysicsManager';
import { useSceneLoading } from './hooks/useSceneLoading';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useArtifactModal } from './hooks/useArtifactModal';
import { setupTourLights, useTourLighting } from './hooks/useTourLighting';

export type ArtifactItem = ArtifactModel;

const HeritageTourDetail: React.FC = () => {

    const { id } = useParams<{ id: string }>();
    const destination = culturalDestinationsData.find((item) => item.id === id);

    // Tham chiếu đến phần tử DOM chứa Canvas WebGL
    const mountRef = useRef<HTMLDivElement>(null);
    // Tham chiếu đến toàn bộ container trang để hỗ trợ chế độ Fullscreen
    const containerRef = useRef<HTMLDivElement>(null);

    // =========================================================================
    // QUẢN LÝ TRẠNG THÁI NẠP TÀI NGUYÊN (LOADING STATE)
    // =========================================================================
    const {
        pageLoading,
        loadingProgress,
        loadingItemText,
        startLoading,
        updateProgress,
        completeLoading,
    } = useSceneLoading();

    const {
        selectedArtifact,
        isClosing,
        openModal,
        closeModal,
    } = useArtifactModal();

    const {
        lightMode,
        setLightMode,
        lightIntensity,
        setLightIntensity,
        showLightMenu,
        setShowLightMenu,
        attachLights,
        clearLights,
    } = useTourLighting(destination?.environment);

    // =========================================================================
    // QUẢN LÝ CHẾ ĐỘ TOÀN MÀN HÌNH (FULLSCREEN)
    // =========================================================================
    const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

    // =========================================================================
    // QUẢN LÝ GIAO DIỆN & MODAL
    // =========================================================================
    const [showInfo, setShowInfo] = useState<boolean>(true);                 // Bật/tắt bảng thông tin giới thiệu địa điểm
    const [showColliders, setShowColliders] = useState<boolean>(false);     // Bật/tắt hiển thị khung collider helper
    const [ballCount, setBallCount] = useState<number>(0);                   // Số lượng quả bóng vật lý trong scene
    const [bgAssetStatus, setBgAssetStatus] = useState<BackgroundAssetStatus>({
        total: destination?.artifacts?.length || 0,
        loaded: 0,
        currentName: '',
        isComplete: false,
    });
    const physicsManagerRef = useRef<CannonPhysicsManager | null>(null);
    const playerRef = useRef<THREE.Object3D | null>(null);

    /**
     * Thả quả bóng vật lý mới phía trước mặt người chơi
     */
    const handleSpawnBall = () => {
        if (physicsManagerRef.current) {
            if (playerRef.current) {
                physicsManagerRef.current.spawnBallInFrontOfPlayer(playerRef.current, 2.0);
            } else {
                physicsManagerRef.current.spawnBall();
            }
            setBallCount(physicsManagerRef.current.getBallCount());
        }
    };

    /**
     * Dọn dẹp toàn bộ quả bóng vật lý
     */
    const handleClearBalls = () => {
        if (physicsManagerRef.current) {
            physicsManagerRef.current.clearBalls();
            setBallCount(0);
        }
    };


    // =========================================================================
    // QUẢN LÝ VẬT LÝ & VA CHẠM (COLLIDER & PHYSICS)
    // =========================================================================
    // Tham chiếu đến ColliderManager để điều khiển bật/tắt helper từ React State
    const colliderManagerRef = useRef<ColliderManager | null>(null);

    // Đồng bộ trạng thái hiển thị collider helper khi người dùng toggle
    useEffect(() => {
        if (colliderManagerRef.current) {
            colliderManagerRef.current.setHelpersVisible(showColliders);
        }
    }, [showColliders]);

    // =========================================================================
    // VÒNG ĐỜI CHÍNH KHỞI TẠO VÀ ĐIỀU HÀNH KHÔNG GIAN 3D THREE.JS
    // =========================================================================
    useEffect(() => {
        if (!destination) {
            return;
        }
        if (!mountRef.current) {
            return;
        }

        const threeEnviroment = new ThreeEnvironment();

        threeEnviroment.camera = ExtendThreeCamera.createDefaultPerspectiveCameraFromRef(mountRef);
        threeEnviroment.scene = ExtendThreeScene.createDefaultScene();
        threeEnviroment.renderer = ExtendThreeRenderer.createDefaultRendererFromRef(mountRef);

        mountRef.current.appendChild(threeEnviroment.renderer.domElement);

        startLoading('Khởi tạo không gian 3D...');
        // LoadingManager chuyên trách cho tài nguyên bắt buộc (Environment, Player, Animations)
        const mandatoryLoadingManager = new THREE.LoadingManager(
            // onLoad -> hoàn tất tài nguyên bắt buộc, mở giao diện
            () => completeLoading('Sẵn sàng khám phá!'),
            // onProgress -> cập nhật % và tên file bắt buộc
            (url, itemsLoaded, itemsTotal) => {
                const pct = Math.round((itemsLoaded / itemsTotal) * 100);
                const filename = url.split('/').pop() || '';
                updateProgress(pct, `Đang nạp mô hình: ${filename}`);
            },
            // onError
            (url) => console.warn(`Lỗi khi tải tài nguyên 3D bắt buộc: ${url}`)
        );

        // Khởi tạo loader cho tài nguyên bắt buộc
        const mandatoryGltfLoader = new GLTFLoader(mandatoryLoadingManager);
        const mandatoryFbxLoader = new FBXLoader(mandatoryLoadingManager);

        // Lấy kích thước thực tế của vùng chứa canvas WebGL
        const container = mountRef.current;

        threeEnviroment.camera.position.set(0, 4, 10);


        // Gắn tham chiếu ánh sáng vào hook useTourLighting để điều khiển
        const lights = setupTourLights(threeEnviroment.scene, lightMode, lightIntensity);
        attachLights({
            scene: threeEnviroment.scene,
            hemiLight: lights.hemiLight,
            ambientLight: lights.ambientLight,
            keyLight: lights.keyLight,
            fillLight: lights.fillLight,
            rimLight: lights.rimLight,
        });

        // ---------------------------------------------------------------------
        // 5. Khởi tạo Collider, Physics và nạp ngầm danh sách cổ vật 3D
        // ---------------------------------------------------------------------
        const interactiveArtifacts: THREE.Object3D[] = [];
        const colliderManager = new ColliderManager(threeEnviroment.scene);
        colliderManager.setHelpersVisible(showColliders);
        colliderManagerRef.current = colliderManager;

        // Khởi tạo hệ thống vật lý Cannon-es cho quả bóng và tương tác người chơi
        const cannonPhysicsManager = new CannonPhysicsManager({
            scene: threeEnviroment.scene,
            floorY: 0,
            playerRadius: 0.8,
            maxBalls: 20,
            colliderManager: colliderManager,
        });
        physicsManagerRef.current = cannonPhysicsManager;

        const threeBehaviours = new ThreeBehaviours();

        // Tải ngầm danh sách cổ vật trong nền (Non-blocking, kèm Placeholder Cube & Progress Bar)
        const bgGltfLoader = new GLTFLoader();
        const placeholders = new Map<string, ArtifactLoadingPlaceholder>();

        if (destination.artifacts) {
            destination.artifacts.forEach((artifact) => {
                const placeholder = new ArtifactLoadingPlaceholder(
                    threeEnviroment.scene,
                    artifact.position,
                    artifact.name,
                    1.2
                );
                const rotateBehaviour = new PlaceholderRotateBehaviour(placeholder);
                threeBehaviours.Register(placeholder.group, rotateBehaviour);
                placeholders.set(artifact.id, placeholder);
            });
        }

        const loadDeferredArtifacts = async () => {
            if (!destination.artifacts || destination.artifacts.length === 0) {
                setBgAssetStatus({ total: 0, loaded: 0, currentName: '', isComplete: true });
                return;
            }

            const total = destination.artifacts.length;
            let loadedCount = 0;

            for (const artifact of destination.artifacts) {
                setBgAssetStatus({
                    total,
                    loaded: loadedCount,
                    currentName: artifact.name,
                    isComplete: false,
                });

                const placeholder = placeholders.get(artifact.id);

                try {
                    const gltf = await loadModelAsync(bgGltfLoader, artifact.modelUrl, {
                        position: artifact.position,
                        scale: artifact.scale,
                        rotation: artifact.rotation,
                        scene: threeEnviroment.scene,
                        onProgress: (e) => {
                            if (e.total > 0 && placeholder) {
                                const pct = (e.loaded / e.total) * 100;
                                placeholder.updateProgress(pct);
                            }
                        },
                        onBeforeAdd: (model) => {
                            // Khi model thật chuẩn bị add vào scene, dọn dẹp placeholder
                            if (placeholder) {
                                threeBehaviours.Remove(placeholder.group);
                                placeholder.dispose();
                                placeholders.delete(artifact.id);
                            }

                            model.userData = { artifact, artifactId: artifact.id };
                            model.traverse((child) => {
                                child.userData = { artifact, artifactId: artifact.id };
                            });
                            const rotateBehaviour = new ArtifactRotateBehaviour(new THREE.Vector3(0, 0.3, 0));
                            threeBehaviours.Register(model, rotateBehaviour);
                        },
                    });

                    interactiveArtifacts.push(gltf.scene);
                    colliderManager.addDynamicObject(gltf.scene);
                } catch (err) {
                    console.warn(`Lỗi khi nạp mô hình cổ vật ${artifact.name}:`, err);
                    if (placeholder) {
                        threeBehaviours.Remove(placeholder.group);
                        placeholder.dispose();
                        placeholders.delete(artifact.id);
                    }
                }

                loadedCount++;
                setBgAssetStatus({
                    total,
                    loaded: loadedCount,
                    currentName: artifact.name,
                    isComplete: loadedCount >= total,
                });
            }
        };

        loadDeferredArtifacts();

        // ---------------------------------------------------------------------
        // 6. Nạp mô hình không gian phòng trưng bày 3D & Xây dựng BVH Collider tĩnh (Bắt buộc)
        // ---------------------------------------------------------------------
        if (destination.environment != null) {
            loadModelAsync(
                mandatoryGltfLoader,
                destination.environment.modelUrl,
                {
                    position: destination.environment.position,
                    scale: destination.environment.scale,
                    rotation: destination.environment.rotation,
                    scene: threeEnviroment.scene,
                }
            ).then((envGltf) => {
                colliderManager.setStaticEnvironment(envGltf.scene);
            }).catch((err) => {
                console.warn('Lỗi khi nạp mô hình môi trường phòng trưng bày:', err);
            });
        }
        let playerMovement: PlayerMovementBehaviour | null = null;
        let cameraOrbit: ThirdPersonOrbitBehaviour | null = null;
        const threeAnimation = new ThreeAnimation();
        const playerLoader = new PlayerLoader();

        playerLoader.loadPlayerModel(mandatoryGltfLoader, threeEnviroment.scene)
            .then(async (player) => {
                threeAnimation.setRoot(player);

                const [idleClip, walkClip] = await Promise.all([
                    playerLoader.loadIdleAnimation(mandatoryFbxLoader),
                    playerLoader.loadWalkAnimation(mandatoryFbxLoader)
                ]);

                if (idleClip) threeAnimation.add(PlayerAnimationKey.Idle, idleClip);
                if (walkClip) threeAnimation.add(PlayerAnimationKey.Walk, walkClip);

                threeAnimation.play(PlayerAnimationKey.Idle, 0.2);

                // Gắn capsule collider helper cho Player (Bán kính 0.8m, cao 6.8m bao phủ toàn bộ nhân vật)
                const playerColliderRadius = 0.8;
                const playerColliderHeight = 6.8;
                colliderManager.attachPlayer(player, playerColliderRadius, playerColliderHeight);

                // Đăng ký PlayerMovementBehaviour với ColliderManager
                playerMovement = new PlayerMovementBehaviour({
                    camera: threeEnviroment.camera,
                    animation: threeAnimation,
                    moveSpeed: 3.5,
                    turnSpeed: 10.0,
                    colliderManager: colliderManager,
                    playerRadius: playerColliderRadius,
                });
                threeBehaviours.Register(player, playerMovement);
                playerMovement.Start();

                // Đăng ký ThirdPersonOrbitBehaviour cho camera xoay quanh nhân vật bằng chuột
                cameraOrbit = new ThirdPersonOrbitBehaviour({
                    target: player,
                    domElement: mountRef.current || window,
                    distance: 12.0,
                    minDistance: 2.0,
                    maxDistance: 22.0,
                    targetOffset: new THREE.Vector3(0, 1.2, 0),
                    rotateSpeed: 0.005,
                    zoomSpeed: 0.01,
                    smoothSpeed: 10.0,
                    collisionZoomInSpeed: 25.0,
                    minPolarAngle: THREE.MathUtils.degToRad(10),
                    maxPolarAngle: THREE.MathUtils.degToRad(80),
                    colliderManager: colliderManager,
                    collisionPadding: 0.35,
                });
                threeBehaviours.Register(threeEnviroment.camera, cameraOrbit);
                cameraOrbit.Start();

                // Lưu tham chiếu player và sinh quả bóng mẫu phía trước
                playerRef.current = player;
                cannonPhysicsManager.spawnBall(new THREE.Vector3(0, 2.0, 3.2));
                setBallCount(cannonPhysicsManager.getBallCount());
            })
            .catch((err) => {
                console.error("Lỗi khi load player/animation:", err);
            });
        // ---------------------------------------------------------------------
        // 7. Raycasting tương tác chuột với cổ vật (Hover pointer & Click mở Modal)
        // ---------------------------------------------------------------------
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let pointerDownPos = { x: 0, y: 0 };

        const handlePointerDown = (event: MouseEvent) => {
            pointerDownPos = { x: event.clientX, y: event.clientY };
        };

        const handlePointerMove = (event: MouseEvent) => {
            if (!mountRef.current) return;
            const pointer = getNormalizedPointer(event, mountRef.current);
            mouse.x = pointer.x;
            mouse.y = pointer.y;

            raycaster.setFromCamera(mouse, threeEnviroment.camera);

            // 1. Kiểm tra hover trên quả bóng vật lý
            const ballMeshes = cannonPhysicsManager.getBallMeshes();
            if (ballMeshes.length > 0) {
                const ballIntersects = raycaster.intersectObjects(ballMeshes, false);
                if (ballIntersects.length > 0) {
                    document.body.style.cursor = 'pointer';
                    return;
                }
            }

            if (interactiveArtifacts.length === 0) {
                document.body.style.cursor = 'default';
                return;
            }

            const intersects = raycaster.intersectObjects(interactiveArtifacts, true);

            let hoveredId: string | null = null;
            if (intersects.length > 0) {
                // Duyệt ngược lên cây phân cấp để tìm object gốc có chứa artifactId
                let curr: THREE.Object3D | null = intersects[0].object;
                while (curr) {
                    if (curr.userData && curr.userData.artifactId) {
                        hoveredId = curr.userData.artifactId;
                        break;
                    }
                    curr = curr.parent;
                }
            }

            document.body.style.cursor = hoveredId ? 'pointer' : 'default';
        };

        const handleCanvasClick = (event: MouseEvent) => {
            if (!mountRef.current) return;

            // Nếu người dùng kéo chuột để xoay camera (> 6px), bỏ qua sự kiện click
            const dragDistance = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
            if (dragDistance > 6) return;

            const pointer = getNormalizedPointer(event, mountRef.current);
            mouse.x = pointer.x;
            mouse.y = pointer.y;

            raycaster.setFromCamera(mouse, threeEnviroment.camera);

            // 1. Kiểm tra click vào quả bóng vật lý -> sút quả bóng theo hướng nhìn
            const ballMeshes = cannonPhysicsManager.getBallMeshes();
            if (ballMeshes.length > 0) {
                const ballIntersects = raycaster.intersectObjects(ballMeshes, false);
                if (ballIntersects.length > 0) {
                    const hitBallMesh = ballIntersects[0].object;
                    const ballItem = cannonPhysicsManager.getBallByMesh(hitBallMesh);
                    if (ballItem) {
                        const kickDir = raycaster.ray.direction.clone();
                        cannonPhysicsManager.kickBall(ballItem.body, kickDir, 16.0);
                        return;
                    }
                }
            }

            // 2. Click vào cổ vật trưng bày
            if (interactiveArtifacts.length === 0) return;
            const intersects = raycaster.intersectObjects(interactiveArtifacts, true);

            if (intersects.length > 0) {
                let curr: THREE.Object3D | null = intersects[0].object;
                while (curr) {
                    if (curr.userData && curr.userData.artifactId) {
                        const targetArtifact = destination.artifacts.find(a => a.id === curr!.userData.artifactId);
                        if (targetArtifact) {
                            openModal(targetArtifact);
                        }
                        break;
                    }
                    curr = curr.parent;
                }
            }
        };

        // Phím tắt tương tác với bóng: B (Thả bóng), F (Sút bóng)
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (event.code === 'KeyB') {
                if (playerRef.current) {
                    cannonPhysicsManager.spawnBallInFrontOfPlayer(playerRef.current, 2.2);
                } else {
                    cannonPhysicsManager.spawnBall();
                }
                setBallCount(cannonPhysicsManager.getBallCount());
            } else if (event.code === 'KeyF') {
                if (playerRef.current) {
                    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(playerRef.current.quaternion);
                    cannonPhysicsManager.kickNearestBall(playerRef.current.position, forward, 4.0, 18.0);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('click', handleCanvasClick);

        // ---------------------------------------------------------------------
        // 8. Vòng lặp Render thời gian thực (Render Loop - 60 FPS)
        // ---------------------------------------------------------------------
        const clock = new THREE.Clock();
        const fpsTracker = new FpsTracker(400, (metrics) => {
            window.dispatchEvent(new CustomEvent('fps-metric-update', { detail: metrics }));
        });
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            fpsTracker.update();

            const delta = clock.getDelta();

            // Cập nhật hoạt ảnh tự động xoay tròn đều của các cổ vật
            threeBehaviours.Update(delta);
            threeAnimation.update(delta);

            // Cập nhật mô phỏng vật lý Cannon-es
            if (playerRef.current) {
                cannonPhysicsManager.updatePlayer(playerRef.current.position, delta);
            }
            cannonPhysicsManager.update(delta);

            // Cập nhật LateUpdate cho các behaviour sau khi các cập nhật hoàn tất
            threeBehaviours.LateUpdate(delta);

            // Thực hiện vẽ khung hình 3D lên WebGL Canvas
            threeEnviroment.renderer.render(threeEnviroment.scene, threeEnviroment.camera);
        };

        // Kích hoạt vòng lặp render
        animate();

        // ---------------------------------------------------------------------
        // 9. Xử lý co giãn kích thước cửa sổ trình duyệt (Window Resize)
        // ---------------------------------------------------------------------
        const handleResize = () => {
            handleWindowResize(threeEnviroment.camera, threeEnviroment.renderer, mountRef.current);
        };

        window.addEventListener('resize', handleResize);

        // ---------------------------------------------------------------------
        // 10. Dọn dẹp tài nguyên khi unmount component (Memory Cleanup)
        // ---------------------------------------------------------------------
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('click', handleCanvasClick);
            document.body.style.cursor = 'default';

            playerMovement?.dispose();
            cameraOrbit?.dispose();
            colliderManager.dispose();
            colliderManagerRef.current = null;
            cannonPhysicsManager.dispose();
            physicsManagerRef.current = null;
            playerRef.current = null;
            clearLights();

            placeholders.forEach((placeholder) => {
                threeBehaviours.Remove(placeholder.group);
                placeholder.dispose();
            });
            placeholders.clear();

            cancelAnimationFrame(animationFrameId);

            if (container.contains(threeEnviroment.renderer.domElement)) {
                container.removeChild(threeEnviroment.renderer.domElement);
            }

            // Giải phóng tài nguyên WebGL khỏi bộ nhớ card đồ hoạ (GPU)
            disposeHierarchy(threeEnviroment.scene);
            threeEnviroment.renderer.dispose();
        };
    }, [destination]);

    // Nếu không tìm thấy thông tin địa điểm theo ID URL, hiển thị trang thông báo 404
    if (!destination) {
        return <HeritageNotFound id={id} />;
    }

    // =========================================================================
    // RENDER GIAO DIỆN CHÍNH CỦA KHÔNG GIAN DI SẢN 3D
    // =========================================================================
    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#080b12] font-sans"
        >
            {/* Lớp 1: Màn hình chờ (Overlay Loading) che phủ toàn màn hình khi đang nạp 3D */}
            {pageLoading && (
                <SceneLoadingOverlay
                    destinationName={destination?.name}
                    loadingProgress={loadingProgress}
                    loadingItemText={loadingItemText}
                />
            )}

            {/* Lớp 1.5: Badge trạng thái nạp ngầm cổ vật khi đang trong phòng */}
            <ArtifactLoadingBadge status={bgAssetStatus} />

            {/* Lớp 2: Vùng chứa Canvas WebGL dựng hình Three.js */}
            <div
                ref={mountRef}
                className="w-full h-full absolute inset-0"
            />

            {/* Lớp 3: Thanh tiêu đề & Thanh tác vụ trên cùng (Top Bar Header) */}
            <header className="absolute top-5 left-5 right-5 flex justify-between items-center pointer-events-none z-10">
                {/* Nút quay lại danh sách & Tiêu đề tên địa điểm di sản */}
                <TourNavigationBadge destination={destination} />

                {/* Các nút bấm thao tác nhanh: Đổi ánh sáng, Bật thông tin, Fullscreen, FPS, Toggle Collider */}
                <TourActionToolbar
                    showLightMenu={showLightMenu}
                    onToggleLightMenu={() => setShowLightMenu(!showLightMenu)}
                    showInfo={showInfo}
                    onToggleInfo={() => setShowInfo(!showInfo)}
                    showColliders={showColliders}
                    onToggleColliders={() => setShowColliders(!showColliders)}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    ballCount={ballCount}
                    onSpawnBall={handleSpawnBall}
                    onClearBalls={handleClearBalls}
                />
            </header>

            {/* Lớp 4: Cụm các bảng điều khiển bên cánh trái (Side Panels Group) */}
            <div className="absolute top-[74px] left-5 w-[340px] max-h-[calc(100vh-94px)] flex flex-col gap-3.5 z-15 overflow-y-auto pointer-events-none">
                {/* 4.1. Bảng điều chỉnh ánh sáng môi trường 3D */}
                {showLightMenu && (
                    <LightingControlPanel
                        onClose={() => setShowLightMenu(false)}
                        lightMode={lightMode}
                        setLightMode={setLightMode}
                        lightIntensity={lightIntensity}
                        setLightIntensity={setLightIntensity}
                    />
                )}

                {/* 4.2. Bảng thông tin giới thiệu chi tiết di tích & số lượng cổ vật */}
                {showInfo && <DestinationInfoDrawer destination={destination} onClose={() => setShowInfo(false)} />}

                {/* 4.3. Bảng hướng dẫn phím bấm di chuyển và tương tác cổ vật */}
                <TourInteractionGuide />
            </div>

            {/* Lớp 5: Drawer Modal trượt bên phải hiển thị chi tiết cổ vật và xem 3D 360 độ */}
            {selectedArtifact && (
                <ArtifactDetailModal
                    artifact={selectedArtifact}
                    isClosing={isClosing}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default HeritageTourDetail;
