import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { ThreeManager } from './threejs/ThreeManager';
import SettingButton from './components/SettingModal/SettingButton';
import SettingsModal, { ControlMode } from './components/SettingModal/SettingsModal';
import {
    culturalDestinationsData,
    ArtifactModel,
    ArtifactInfo
} from '../../models/Destination/CulturalDestinationModel';
import { ArtifactDetailModal } from './components/ArtifactModal/ArtifactDetailModal';
import { useArtifactModal } from './hooks/useArtifactModal';
import { BackgroundAssetStatus } from './threejs/Artifact/types';
import { ViewMode } from './model/ViewMode';
import LoadingScreen from './components/Loading/LoadingScreen';
import { NormalizedProgress } from './threejs/LoadingPipeline/NormalizedProgress';
import { LoadingPipeline, } from './threejs/LoadingPipeline/LoadingPipeline';
import { DelayLoadingStep } from './threejs/LoadingPipeline/DelayLoadingStep';
import { RetryLoadingStep } from './threejs/LoadingPipeline/RetryLoadingStep';
import { GlbLoadingStep } from './threejs/LoadingPipeline/GlbLoadingStep';
import { FBXLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { FbxLoadingStep } from './threejs/LoadingPipeline/FbxLoadingStep';
import { LoadingStep } from './threejs/LoadingPipeline/LoadingStep';
import { LoadingProgress } from './threejs/LoadingProgress';

export const DemoMovement: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const threeManagerRef = useRef<ThreeManager | null>(null);

    // Xác định địa điểm ban đầu từ params, query params hoặc state
    const initialDestId =
        id ||
        searchParams.get('destination') ||
        location.state?.destinationId ||
        culturalDestinationsData[0]?.id ||
        'phong-trung-bay-co-vat';

    const [selectedDestinationId, setSelectedDestinationId] = useState<string>(initialDestId);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ThirdPerson);
    const [controlMode, setControlMode] = useState<ControlMode>('keyboard');
    const [isPointerLocked, setIsPointerLocked] = useState(false);

    // Modal chi tiết cổ vật
    const artifactDetailController = useArtifactModal<ArtifactInfo>();

    // Trạng thái nạp ngầm cổ vật
    const [bgAssetStatus, setBgAssetStatus] = useState<BackgroundAssetStatus>({
        total: 0,
        loaded: 0,
        currentName: '',
        isComplete: true,
    });
    const [mainProgressPercent, setMainProgressPercent] = useState<number>(0);
    const [mainProgressStage, setMainProgressStage] = useState<string>("");

    // Cổ vật gần nhất mà nhân vật đang đứng cạnh
    const [proximityArtifact, setProximityArtifact] = useState<ArtifactModel | null>(null);

    const currentDestination =
        culturalDestinationsData.find((d) => d.id === selectedDestinationId) ||
        culturalDestinationsData[0];


    // Tải bộ cổ vật mới khi người dùng chuyển đổi địa điểm
    const handleSelectDestination = (destId: string) => {
        setSelectedDestinationId(destId);
        setSearchParams({ destination: destId });
        const target = culturalDestinationsData.find((d) => d.id === destId);
        if (target && threeManagerRef.current) {
            threeManagerRef.current.loadDestinationArtifacts(target);
        }
    };

    useEffect(() => {
        threeManagerRef.current?.setControlMode(controlMode);
    }, [controlMode]);

    useEffect(() => {
        threeManagerRef.current?.setViewMode(viewMode);
    }, [viewMode]);

    useEffect(() => {
        if (isSettingsOpen || artifactDetailController.selectedArtifact) {
            threeManagerRef.current?.unlockPointer();
            threeManagerRef.current?.resetMovementInput();
        }
    }, [isSettingsOpen, artifactDetailController.selectedArtifact]);


    useEffect(() => {
        let isMounted = true;

        const runLoadingPipeline = async () => {
            const manager = new ThreeManager();

            const loadingProgress = new LoadingProgress();
            loadingProgress.getFBXLoader = () => manager.fbxLoader;

            threeManagerRef.current = manager;

            manager.containerRef = containerRef;
            manager.canvasContainerRef = canvasContainerRef;

            manager.createScene();
            manager.createCamera();
            manager.createRenderer();
            manager.createInput();
            manager.createHemiLight();
            manager.createAmbientLight();
            manager.createPhysicWorld();
            manager.createHelpers();
            manager.createPlane();
            manager.createChair();

            manager.onLockChange = (locked) => {
                setIsPointerLocked(locked);
            };

            manager.onBackgroundAssetStatus = (status) => {
                setBgAssetStatus(status);
            };

            manager.onProximityChange = (artifact) => {
                setProximityArtifact(artifact);
            };

            manager.onSelectArtifact = (art) => {
                manager.unlockPointer();
                artifactDetailController.openModal(art);
            };




            const pipeline = new LoadingPipeline<StepMeta>();

            const playerLoadProgress = loadingProgress.createPlayerLoader();
            pipeline.add(playerLoadProgress.step, {
                id: 'step-player',
                title: 'Load player',
                icon: '⏳',
                fbxStep: playerLoadProgress
            });
            const playerIdleLoadProgress = loadingProgress.createPlayerIdleLoader();
            pipeline.add(playerIdleLoadProgress.step, {
                id: 'step-delay',
                title: 'Load Idle',
                icon: '⏳',

                fbxStep: playerIdleLoadProgress
            });
            const playerWalkLoadProgress = loadingProgress.createPlayerWalkLoader();
            pipeline.add(playerWalkLoadProgress.step, {
                id: 'step-delay',
                title: 'Load Walk',
                icon: '⏳',
                fbxStep: playerWalkLoadProgress
            });


            const delayLoadBackground = new DelayLoadingStep(1);
            pipeline.add(delayLoadBackground.step, {
                id: 'step-delay',
                title: 'Load background',
                icon: '⏳'
            });

            pipeline.onProgress = (percent, meta, step) => {
                if (!isMounted) return;
                setMainProgressPercent(percent);
                const fbx = meta?.fbxStep;
                const byteInfo = fbx && fbx.totalBytes > 0 ? ` (${fbx.getFormattedBytes('MB')})` : '';
                setMainProgressStage(`${meta.title}: ${Math.floor(step.progress.progress * 100)}%${byteInfo}`);
            };

            pipeline.onComplete = () => {
                if (!isMounted) return;
                setMainProgressPercent(100);
            };

            await pipeline.executeSequentialAsync();








            manager.OnStart();
            manager.setViewMode(viewMode);

            // Tải cổ vật của địa điểm đã chọn
            if (currentDestination) {
                manager.loadDestinationArtifacts(currentDestination);
            }




            manager.environment.scene.add(playerLoadProgress.step.response.result);
            manager.playerController.setPrefab(playerLoadProgress.step.response.result);

            if (manager.playerController.cannonBodyAttachBox?.object3D) {
                manager.environment.scene.add(manager.playerController.cannonBodyAttachBox.object3D);
                manager.perspectiveStateMachine.onPlayerLoaded();
            }
            if (manager.playerController.cannonBodyAttachBox?.cannonBody) {
                manager.cannonBehaviour.world.addBody(manager.playerController.cannonBodyAttachBox.cannonBody);
            }

            manager.playerController.onStart();











            return () => {
                manager.OnDestroy();
                threeManagerRef.current = null;
            };
        };

        runLoadingPipeline();

        return () => {
            isMounted = false;
        };
    }, []);
    interface StepMeta {
        id: string;
        title: string;
        icon: string;
        fbxStep?: FbxLoadingStep;
    }
    return (
        <div ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0d1117] font-sans">
            {mainProgressPercent < 99 && <LoadingScreen
                progress={mainProgressPercent}
                stage={mainProgressStage}
            />}
            <div ref={canvasContainerRef} className="w-full h-full absolute inset-0" />

            {/* Tâm ngắm (Crosshair) khi ở góc nhìn thứ nhất */}
            {viewMode === ViewMode.FirstPerson && (
                <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-20">
                    <div className="w-2.5 h-2.5 rounded-full border border-white/80 bg-white/40 shadow-sm backdrop-blur-[1px]" />
                </div>
            )}

            {/* Thông báo hướng dẫn khóa chuột trong FPV */}
            {viewMode === ViewMode.FirstPerson && !isPointerLocked && !isSettingsOpen && !artifactDetailController.selectedArtifact && (
                <div
                    onClick={() => threeManagerRef.current?.requestPointerLock()}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium cursor-pointer transition shadow-xl flex items-center gap-2 select-none"
                >
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Nhấp vào màn hình để xoay góc nhìn thứ nhất (ESC để thoát)</span>
                </div>
            )}

            {/* Header điều hướng & hiển thị tên địa điểm */}
            <header className="absolute top-5 left-5 right-5 flex justify-between items-center pointer-events-none z-20">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                        onClick={() => navigate('/heritage-tour')}
                        className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-sm font-medium transition cursor-pointer flex items-center gap-2 shadow-lg"
                    >
                        <span>←</span> Quay lại
                    </button>

                    {currentDestination && (
                        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-md">
                            <span className="text-amber-400">🏛️</span>
                            <span>{currentDestination.name}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Thông báo gợi ý tương tác phím [E] khi nhân vật đứng gần cổ vật */}
            {proximityArtifact && !artifactDetailController.selectedArtifact && !isSettingsOpen && (
                <div
                    onClick={() => {
                        threeManagerRef.current?.unlockPointer();
                        artifactDetailController.openModal(proximityArtifact.artifact);
                    }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-sky-400/40 text-white shadow-[0_10px_30px_rgba(56,189,248,0.25)] transition duration-200 hover:scale-105 cursor-pointer select-none"
                >
                    <kbd className="px-2.5 py-1 text-xs font-extrabold bg-sky-500 text-slate-950 rounded-lg shadow-sm">
                        E
                    </kbd>
                    <div className="flex flex-col">
                        <span className="text-xs text-sky-300 font-medium">Đang ở gần cổ vật</span>
                        <span className="text-sm font-bold text-white leading-tight">
                            Xem {proximityArtifact.name}
                        </span>
                    </div>
                </div>
            )}


            {/* Cụm nút hành động */}
            <div className="fixed bottom-5 left-5 z-20 flex items-center gap-2.5">
                <SettingButton
                    onClick={() => setIsSettingsOpen((prev) => !prev)}
                />
            </div>

            {/* Modal cài đặt */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                soundEnabled={soundEnabled}
                onSoundToggle={setSoundEnabled}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                controlMode={controlMode}
                onControlModeChange={setControlMode}
                selectedDestinationId={selectedDestinationId}
                onSelectDestination={handleSelectDestination}
            />

            {/* Modal hiển thị chi tiết cổ vật 3D 360 độ */}
            {artifactDetailController.selectedArtifact && (
                <ArtifactDetailModal
                    artifact={artifactDetailController.selectedArtifact}
                    isClosing={artifactDetailController.isClosing}
                    onClose={artifactDetailController.closeModal}
                />
            )}
        </div>
    );
};

export default DemoMovement;