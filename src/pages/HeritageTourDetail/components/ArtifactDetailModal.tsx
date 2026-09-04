import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

interface Artifact3DViewerProps {
    artifact: ArtifactItem;
    zoomLevel: number;
}

const Artifact3DViewer: React.FC<Artifact3DViewerProps> = ({ artifact, zoomLevel }) => {
    const modalCanvasRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (!modalCanvasRef.current) return;
        setLoading(true);
        setProgress(0);

        const container = modalCanvasRef.current;
        const width = container.clientWidth || 380;
        const height = container.clientHeight || 320;

        // 1. Modal 3D Scene & Camera
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121520);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0.5, 4 / zoomLevel);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // 2. OrbitControls for 360-degree rotation inside modal
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.autoRotate = true; // Auto rotates slowly for dynamic presentation
        controls.autoRotateSpeed = 0.8;

        // 3. Multi-point Studio Lighting (Bright & Deep)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
        scene.add(hemiLight);

        const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambLight);

        const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
        dirLight1.position.set(5, 10, 7);
        dirLight1.castShadow = true;
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.8);
        dirLight2.position.set(-6, -2, -5);
        scene.add(dirLight2);

        const backLight = new THREE.PointLight(0xfffbe6, 2.0, 15);
        backLight.position.set(0, 4, -4);
        scene.add(backLight);

        const pedUplight = new THREE.PointLight(artifact.color || 0x38bdf8, 2.5, 5);
        pedUplight.position.set(0, -0.6, 0);
        scene.add(pedUplight);

        // 4. Artifact 3D Geometry Setup (Always load GLB model)
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

                scene.add(loadedModel);
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

        // 5. Render Loop
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            camera.position.setLength(4 / zoomLevel);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // 6. Cleanup
        return () => {
            cancelAnimationFrame(frameId);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            disposeHierarchy(scene);
            renderer.dispose();
        };
    }, [artifact, zoomLevel]);

    return (
        <div className="relative w-full h-[310px] rounded-xl overflow-hidden">
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
    
    // Sử dụng audio player thực tế
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
    }, [artifact]);

    return (
        <div
            className={`fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-xs flex justify-end items-stretch z-100 ${
                isClosing ? 'animate-fade-out-backdrop' : 'animate-fade-in-backdrop'
            }`}
            onClick={onClose}
        >
            <div
                className={`w-[520px] max-w-[90vw] h-screen bg-[#141824]/95 border-l border-white/15 rounded-l-3xl p-7 shadow-[-12px_0_45px_0_rgba(0,0,0,0.75)] flex flex-col gap-5 relative text-slate-50 overflow-y-auto ${
                    isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE BUTTON (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/80 border border-white/20 text-white text-lg cursor-pointer flex items-center justify-center transition-all duration-200 z-10"
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
                <div className="bg-[#121520] rounded-[18px] border border-white/10 p-3.5 flex flex-col items-center justify-between relative min-h-[300px] shrink-0">
                    {/* Zoom +/- controls top right */}
                    <div className="absolute top-3 right-3 flex gap-1.5 z-15">
                        <button
                            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                            className="bg-slate-800/85 hover:bg-slate-700/90 border border-white/20 text-white w-8 h-8 rounded-lg cursor-pointer font-bold flex items-center justify-center transition-colors"
                        >
                            -
                        </button>
                        <button
                            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                            className="bg-slate-800/85 hover:bg-slate-700/90 border border-white/20 text-white w-8 h-8 rounded-lg cursor-pointer font-bold flex items-center justify-center transition-colors"
                        >
                            +
                        </button>
                    </div>

                    {/* 3D Interactive Canvas Sub-Component */}
                    <Artifact3DViewer artifact={artifact} zoomLevel={zoomLevel} />

                    {/* Instruction caption */}
                    <p className="m-0 mt-2 text-xs text-slate-400 text-center leading-relaxed">
                        Chạm/Kéo để xoay 360° • Cuộn hoặc +/- để phóng to/thu nhỏ
                    </p>
                </div>

                {/* DESCRIPTION CONTENT */}
                <div>
                    <h3 className="m-0 mb-2 text-sm font-semibold text-slate-50 uppercase tracking-[0.5px]">
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
