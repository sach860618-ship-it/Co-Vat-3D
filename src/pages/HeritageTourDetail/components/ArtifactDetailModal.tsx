import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { normalizeModelBounds, enableShadows, disposeHierarchy } from '../../../utils/three';
import { useAudioPlayer } from '../../../hooks/useAudioPlayer';

export interface ArtifactItem {
    id: string;
    name: string;
    tagline: string;
    description: string;
    thumbnail: string;
    scale: THREE.Vector3;
    rotation: THREE.Vector3;
    position: THREE.Vector3;
    color?: number;
    modelUrl?: string;
    audioUrl?: string;
}

export type LightingDisplayMode = 'studio' | 'unlit';

interface Artifact3DViewerProps {
    artifact: ArtifactItem;
    zoomLevel: number;
    lightMode: LightingDisplayMode;
    lightIntensity: number;
    autoRotate: boolean;
    resetKey: number;
}

const Artifact3DViewer: React.FC<Artifact3DViewerProps> = ({
    artifact,
    zoomLevel,
    lightMode,
    lightIntensity,
    autoRotate,
    resetKey,
}) => {
    const modalCanvasRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const lightsGroupRef = useRef<THREE.Group | null>(null);
    const headlightRef = useRef<THREE.DirectionalLight | null>(null);
    const modelGroupRef = useRef<THREE.Group | null>(null);
    const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
    const roomEnvTextureRef = useRef<THREE.Texture | null>(null);
    const roomEnvRenderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
    const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null);

    // 1. Khởi tạo Scene, Camera, WebGLRenderer, RoomEnvironment và Model (chỉ chạy lại khi đổi cổ vật)
    useEffect(() => {
        if (!modalCanvasRef.current) return;
        setLoading(true);
        setProgress(0);
        originalMaterialsRef.current.clear();

        const container = modalCanvasRef.current;
        const width = container.clientWidth || 380;
        const height = container.clientHeight || 320;

        // 1.1. Khởi tạo Scene & Camera
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121520);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0.5, 4 / zoomLevel);
        cameraRef.current = camera;

        // 1.2. WebGLRenderer chuẩn PBR Tone Mapping & Color Space
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // 1.3. RoomEnvironment cho phản xạ PBR chân thực (khắc phục lỗi kim loại/sứ bị đen)
        const roomEnv = new RoomEnvironment();
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGeneratorRef.current = pmremGenerator;
        const roomEnvRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
        roomEnvRenderTargetRef.current = roomEnvRenderTarget;
        roomEnvTextureRef.current = roomEnvRenderTarget.texture;
        scene.environment = roomEnvRenderTarget.texture;
        roomEnv.dispose();

        // 1.4. OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.8;
        controlsRef.current = controls;

        // 1.5. Nhóm đèn chiếu sáng Studio đa điểm
        const lightsGroup = new THREE.Group();
        scene.add(lightsGroup);
        lightsGroupRef.current = lightsGroup;

        // Đèn vòm trời
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
        hemiLight.userData.baseIntensity = 1.0;
        lightsGroup.add(hemiLight);

        // Đèn môi trường
        const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
        ambLight.userData.baseIntensity = 1.2;
        lightsGroup.add(ambLight);

        // Đèn chính Key Light (ấm, bóng đổ mềm mịn không loang lổ)
        const dirLightKey = new THREE.DirectionalLight(0xfffbeb, 2.5);
        dirLightKey.position.set(5, 8, 6);
        dirLightKey.castShadow = true;
        dirLightKey.shadow.bias = -0.0005;
        dirLightKey.shadow.mapSize.set(1024, 1024);
        dirLightKey.userData.baseIntensity = 2.5;
        lightsGroup.add(dirLightKey);

        // Đèn phụ Fill Light
        const dirLightFill = new THREE.DirectionalLight(0x38bdf8, 1.6);
        dirLightFill.position.set(-6, -2, -4);
        dirLightFill.userData.baseIntensity = 1.6;
        lightsGroup.add(dirLightFill);

        // Đèn viền Rim Light
        const rimLight = new THREE.DirectionalLight(0xa855f7, 1.8);
        rimLight.position.set(0, 5, -5);
        rimLight.userData.baseIntensity = 1.8;
        lightsGroup.add(rimLight);

        // Đèn chiếu từ chân bục
        const pedUplight = new THREE.PointLight(artifact.color || 0x38bdf8, 3.0, 6, 1.5);
        pedUplight.position.set(0, -0.6, 0);
        pedUplight.userData.baseIntensity = 3.0;
        lightsGroup.add(pedUplight);

        // Đèn Headlight bám theo góc nhìn Camera (không đưa vào lightsGroup để giữ parent là camera)
        const headlight = new THREE.DirectionalLight(0xffffff, 0.9);
        headlight.userData.baseIntensity = 0.9;
        headlightRef.current = headlight;
        camera.add(headlight);
        scene.add(camera);

        // 1.6. Nạp mô hình 3D cổ vật GLB
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);
        modelGroupRef.current = modelGroup;

        const targetUrl = artifact.modelUrl || '/models/Cup/japanese_tea_cup.glb';
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            encodeURI(targetUrl),
            (gltf) => {
                const loadedModel = gltf.scene;
                normalizeModelBounds(loadedModel, {
                    targetSize: 1.6,
                    scaleMultiplier: 1.0,
                    centerOnGround: false,
                    groundOffsetY: 0,
                });
                enableShadows(loadedModel, true, true);

                // Lưu lại vật liệu gốc để phục vụ chuyển đổi Lit / Unlit
                loadedModel.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        originalMaterialsRef.current.set(mesh, mesh.material);
                    }
                });

                modelGroup.add(loadedModel);
                setLoading(false);
            },
            (xhr) => {
                if (xhr.total > 0) {
                    setProgress(Math.round((xhr.loaded / xhr.total) * 100));
                }
            },
            (err) => {
                console.warn('Lỗi load file GLB trong modal:', err);
                setLoading(false);
            }
        );

        // 1.7. Render Loop
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // 1.8. Dọn dẹp tài nguyên khi unmount
        return () => {
            cancelAnimationFrame(frameId);
            if (pmremGeneratorRef.current) {
                pmremGeneratorRef.current.dispose();
            }
            if (roomEnvRenderTargetRef.current) {
                roomEnvRenderTargetRef.current.dispose();
            }
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            disposeHierarchy(scene);
            renderer.dispose();
        };
    }, [artifact]);

    // 2. CHUYỂN ĐỔI CHẾ ĐỘ ÁNH SÁNG: STUDIO vs UNLIT (KHÔNG CÓ ÁNH SÁNG)
    useEffect(() => {
        if (!modelGroupRef.current || !lightsGroupRef.current || !sceneRef.current) return;

        if (lightMode === 'unlit') {
            // Tắt đèn và môi trường phản xạ
            lightsGroupRef.current.visible = false;
            if (headlightRef.current) {
                headlightRef.current.visible = false;
            }
            sceneRef.current.environment = null;

            // Chuyển toàn bộ mesh sang MeshBasicMaterial (Shadeless / Albedo thuần túy)
            modelGroupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    if (!originalMaterialsRef.current.has(mesh)) {
                        originalMaterialsRef.current.set(mesh, mesh.material);
                    }
                    const origMat = originalMaterialsRef.current.get(mesh) as THREE.MeshStandardMaterial;
                    if (origMat) {
                        mesh.material = new THREE.MeshBasicMaterial({
                            map: origMat.map || null,
                            color: origMat.map ? 0xffffff : (origMat.color || 0xdddddd),
                        });
                    }
                }
            });
        } else {
            // Khôi phục ánh sáng Studio và vật liệu PBR gốc
            lightsGroupRef.current.visible = true;
            if (headlightRef.current) {
                headlightRef.current.visible = true;
            }
            sceneRef.current.environment = roomEnvTextureRef.current;

            modelGroupRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    const origMat = originalMaterialsRef.current.get(mesh);
                    if (origMat) {
                        mesh.material = origMat;
                    }
                }
            });
        }
    }, [lightMode]);

    // 3. ĐIỀU CHỈNH CƯỜNG ĐỘ SÁNG KHI KÉO SLIDER
    useEffect(() => {
        if (!lightsGroupRef.current) return;
        lightsGroupRef.current.traverse((child) => {
            if ((child as THREE.Light).isLight) {
                const light = child as THREE.Light;
                if (light.userData.baseIntensity !== undefined) {
                    light.intensity = light.userData.baseIntensity * lightIntensity;
                }
            }
        });
        if (headlightRef.current && headlightRef.current.userData.baseIntensity !== undefined) {
            headlightRef.current.intensity = headlightRef.current.userData.baseIntensity * lightIntensity;
        }
    }, [lightIntensity]);

    // 4. ĐIỀU KHIỂN ZOOM & TỰ XOAY KHÔNG NẠP LẠI MÔ HÌNH
    useEffect(() => {
        if (!cameraRef.current || !controlsRef.current) return;
        cameraRef.current.position.setLength(4 / zoomLevel);
    }, [zoomLevel]);

    useEffect(() => {
        if (!controlsRef.current) return;
        controlsRef.current.autoRotate = autoRotate;
    }, [autoRotate]);

    // 5. ĐẶT LẠI GÓC NHÌN MẶC ĐỊNH
    useEffect(() => {
        if (!cameraRef.current || !controlsRef.current || resetKey === 0) return;
        cameraRef.current.position.set(0, 0.5, 4 / zoomLevel);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
    }, [resetKey, zoomLevel]);

    return (
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#121520] gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 w-full h-full border-2 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
                        <span className="text-xl">🏺</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-48">
                        <span className="text-xs text-slate-300 font-medium">Đang tải mô hình 3D...</span>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden border border-sky-400/20">
                            <div
                                style={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-[width] duration-150 rounded-full"
                            />
                        </div>
                        {progress > 0 && (
                            <span className="text-[10px] text-sky-400 font-semibold font-mono">{progress}%</span>
                        )}
                    </div>
                </div>
            )}

            <div
                ref={modalCanvasRef}
                className={`w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
                    loading ? 'opacity-0' : 'opacity-100'
                }`}
            />
        </div>
    );
};

export interface ArtifactDetailModalProps {
    artifact: ArtifactItem;
    isClosing: boolean;
    onClose: () => void;
}

export const ArtifactDetailModal: React.FC<ArtifactDetailModalProps> = ({
    artifact,
    isClosing,
    onClose,
}) => {
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [lightMode, setLightMode] = useState<LightingDisplayMode>('studio');
    const [lightIntensity, setLightIntensity] = useState<number>(1.2);
    const [autoRotate, setAutoRotate] = useState<boolean>(true);
    const [resetKey, setResetKey] = useState<number>(0);

    // Audio player cho thuyết minh
    const {
        isPlaying,
        togglePlay,
        progress,
        seek,
        formattedCurrentTime,
        formattedDuration,
    } = useAudioPlayer(artifact.audioUrl);

    useEffect(() => {
        setZoomLevel(1);
        setLightMode('studio');
        setLightIntensity(1.2);
        setAutoRotate(true);
    }, [artifact]);

    const handleResetCamera = useCallback(() => {
        setZoomLevel(1);
        setResetKey((k) => k + 1);
    }, []);

    return (
        <div
            className={`fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-xs flex justify-end items-stretch z-100 ${
                isClosing ? 'animate-fade-out-backdrop' : 'animate-fade-in-backdrop'
            }`}
            onClick={onClose}
        >
            <div
                className={`w-[520px] max-w-[90vw] h-screen bg-[#141824]/95 border-l border-white/15 rounded-l-3xl p-7 shadow-[-12px_0_45px_0_rgba(0,0,0,0.75)] flex flex-col gap-4 relative text-slate-50 overflow-y-auto ${
                    isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE BUTTON (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/80 border border-white/20 text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 z-10"
                    title="Đóng chi tiết"
                >
                    ✕
                </button>

                {/* HEADER: NAME & TAGLINE */}
                <div className="pr-11">
                    <h2 className="m-0 mb-1 text-2xl font-bold text-slate-50">
                        {artifact.name}
                    </h2>
                    <p className="m-0 text-sm text-sky-400 font-medium">
                        {artifact.tagline}
                    </p>
                </div>

                {/* INTERACTIVE 3D OBJECT CANVAS VIEWPORT */}
                <div className="bg-[#121520] rounded-[18px] border border-white/10 p-3 flex flex-col items-center gap-2.5 relative min-h-[350px] shrink-0">
                    {/* BỘ NÚT ĐIỀU KHIỂN GÓC NHÌN (GÓC PHẢI TRÊN) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-15">
                        {/* Nút bật/tắt tự xoay */}
                        <button
                            onClick={() => setAutoRotate((prev) => !prev)}
                            className={`px-2 h-7 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all ${
                                autoRotate
                                    ? 'bg-sky-500/25 border-sky-400/50 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                                    : 'bg-slate-800/85 border-white/20 text-slate-400 hover:text-white'
                            }`}
                            title={autoRotate ? 'Tắt tự động xoay' : 'Bật tự động xoay'}
                        >
                            <span>🔄</span>
                            <span className="hidden sm:inline">{autoRotate ? 'Xoay' : 'Dừng'}</span>
                        </button>

                        {/* Nút đặt lại góc nhìn */}
                        <button
                            onClick={handleResetCamera}
                            className="bg-slate-800/85 hover:bg-slate-700/90 border border-white/20 text-white w-7 h-7 rounded-lg cursor-pointer font-bold flex items-center justify-center transition-colors text-xs"
                            title="Đặt lại góc nhìn mặc định"
                        >
                            ↺
                        </button>

                        {/* Nút thu nhỏ zoom */}
                        <button
                            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                            className="bg-slate-800/85 hover:bg-slate-700/90 border border-white/20 text-white w-7 h-7 rounded-lg cursor-pointer font-bold flex items-center justify-center transition-colors text-xs"
                            title="Thu nhỏ"
                        >
                            -
                        </button>

                        {/* Nút phóng to zoom */}
                        <button
                            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                            className="bg-slate-800/85 hover:bg-slate-700/90 border border-white/20 text-white w-7 h-7 rounded-lg cursor-pointer font-bold flex items-center justify-center transition-colors text-xs"
                            title="Phóng to"
                        >
                            +
                        </button>
                    </div>

                    {/* 3D Interactive Canvas Sub-Component */}
                    <Artifact3DViewer
                        artifact={artifact}
                        zoomLevel={zoomLevel}
                        lightMode={lightMode}
                        lightIntensity={lightIntensity}
                        autoRotate={autoRotate}
                        resetKey={resetKey}
                    />

                    {/* THANH ĐIỀU KHIỂN CHẾ ĐỘ ÁNH SÁNG & ĐỘ SÁNG */}
                    <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 bg-slate-900/80 rounded-xl border border-white/10">
                        {/* Toggle Có ánh sáng / Không có ánh sáng */}
                        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                            <button
                                onClick={() => setLightMode('studio')}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                                    lightMode === 'studio'
                                        ? 'bg-sky-500 text-white shadow-xs font-semibold'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Chế độ ánh sáng Studio chân thực, bóng đổ và phản xạ PBR"
                            >
                                <span>💡</span> Có ánh sáng
                            </button>
                            <button
                                onClick={() => setLightMode('unlit')}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                                    lightMode === 'unlit'
                                        ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Chế độ không có ánh sáng (Unlit), loại bỏ bóng đổ để soi rõ 100% vân hoa văn"
                            >
                                <span>👁️</span> Không ánh sáng
                            </button>
                        </div>

                        {/* Thanh trượt cường độ sáng (chỉ hiển thị khi có ánh sáng) */}
                        {lightMode === 'studio' && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <span>☀️</span> Độ sáng:
                                </span>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.1"
                                    value={lightIntensity}
                                    onChange={(e) => setLightIntensity(Number(e.target.value))}
                                    className="w-18 accent-sky-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                                    title={`Cường độ ánh sáng: ${lightIntensity.toFixed(1)}x`}
                                />
                                <span className="text-[10px] font-mono text-sky-400 min-w-[28px]">
                                    {lightIntensity.toFixed(1)}x
                                </span>
                            </div>
                        )}

                        {lightMode === 'unlit' && (
                            <span className="text-[11px] text-amber-300/90 font-medium">
                                Hiển thị vân hoa văn gốc (Unlit)
                            </span>
                        )}
                    </div>

                    {/* Instruction caption */}
                    <p className="m-0 text-[11px] text-slate-400 text-center leading-relaxed">
                        Chạm/Kéo để xoay 360° • Cuộn chuột để zoom • Bật &ldquo;Không ánh sáng&rdquo; để soi hoa văn
                    </p>
                </div>

                {/* DESCRIPTION CONTENT */}
                <div>
                    <h3 className="m-0 mb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Giới thiệu chi tiết
                    </h3>
                    <p className="m-0 text-sm leading-relaxed text-slate-300">
                        {artifact.description}
                    </p>
                </div>

                {/* AUDIO PLAYER CARD */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 md:p-4.5 mt-auto">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="m-0 text-base font-semibold text-slate-50 flex items-center gap-2">
                            <span>🎙️ Thuyết minh âm thanh</span>
                            {isPlaying && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 animate-pulse">
                                    Đang phát
                                </span>
                            )}
                        </h3>
                    </div>
                    <p className="m-0 mb-3 text-xs text-slate-400">
                        Nghe giọng đọc thuyết minh chi tiết về nguồn gốc và giá trị cổ vật
                    </p>

                    <div className="flex items-center gap-3.5">
                        <button
                            onClick={togglePlay}
                            title={isPlaying ? "Tạm dừng" : "Phát thuyết minh"}
                            className="w-11 h-11 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 active:scale-95 text-slate-900 text-lg cursor-pointer flex items-center justify-center font-bold shadow-[0_4px_14px_rgba(56,189,248,0.4)] transition-all shrink-0 border-0"
                        >
                            {isPlaying ? '❚❚' : '▶'}
                        </button>

                        <div className="flex-1 flex flex-col gap-1.5">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                onChange={(e) => seek(Number(e.target.value))}
                                className="w-full accent-sky-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                            />
                            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                                <span>{formattedCurrentTime}</span>
                                <span>{formattedDuration}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtifactDetailModal;
