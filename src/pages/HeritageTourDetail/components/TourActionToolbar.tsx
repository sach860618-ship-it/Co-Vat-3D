import React from 'react';

import { FpsBadge } from './FpsBadge';

export interface TourActionToolbarProps {
    showLightMenu: boolean;
    onToggleLightMenu: () => void;
    showInfo: boolean;
    onToggleInfo: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    showColliders?: boolean;
    onToggleColliders?: () => void;
    ballCount?: number;
    onSpawnBall?: () => void;
    onClearBalls?: () => void;
    fps?: number;
    frameTimeMs?: number;
}

export const TourActionToolbar: React.FC<TourActionToolbarProps> = ({
    showLightMenu,
    onToggleLightMenu,
    showInfo,
    onToggleInfo,
    isFullscreen,
    onToggleFullscreen,
    showColliders = false,
    onToggleColliders,
    ballCount = 0,
    onSpawnBall,
    onClearBalls,
    fps,
    frameTimeMs,
}) => {
    return (
        <div className="flex items-center gap-2.5 pointer-events-auto">
            <FpsBadge fps={fps} frameTimeMs={frameTimeMs} />

            {onSpawnBall && (
                <button
                    onClick={onSpawnBall}
                    className="backdrop-blur-md border border-orange-500/30 bg-orange-500/20 hover:bg-orange-500/35 text-orange-200 hover:text-white px-3.5 py-2.5 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] active:scale-95"
                    title="Thả quả bóng vật lý mới phía trước nhân vật (Phím tắt: B)"
                >
                    <span>⚽</span>
                    <span>Thả bóng</span>
                    {ballCount > 0 && (
                        <span className="bg-orange-500/80 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {ballCount}
                        </span>
                    )}
                </button>
            )}

            {onClearBalls && ballCount > 0 && (
                <button
                    onClick={onClearBalls}
                    className="backdrop-blur-md border border-red-500/30 bg-red-500/20 hover:bg-red-500/35 text-red-200 hover:text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] active:scale-95"
                    title="Dọn dẹp tất cả quả bóng"
                >
                    <span>🧹</span>
                </button>
            )}

            {onToggleColliders && (
                <button
                    onClick={onToggleColliders}
                    className={`backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${
                        showColliders ? 'bg-emerald-500/85 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-900/75 text-slate-50 hover:bg-slate-800'
                    }`}
                    title="Bật/Tắt hiển thị khung Collider bao quanh cổ vật"
                >
                    <span>🛡️</span> {showColliders ? 'Ẩn Collider' : 'Hiện Collider'}
                </button>
            )}

            <button
                onClick={onToggleLightMenu}
                className={`backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${
                    showLightMenu ? 'bg-sky-400/85 text-slate-900' : 'bg-slate-900/75 text-slate-50 hover:bg-slate-800'
                }`}
            >
                <span>💡</span> Chỉnh Ánh Sáng
            </button>

            <button
                onClick={onToggleInfo}
                className={`backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${
                    showInfo ? 'bg-sky-400/85 text-slate-900' : 'bg-slate-900/75 text-slate-50 hover:bg-slate-800'
                }`}
            >
                {showInfo ? '📖 Ẩn thông tin' : '📖 Hiện thông tin'}
            </button>

            <button
                onClick={onToggleFullscreen}
                className="bg-slate-900/75 hover:bg-slate-800 text-slate-50 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
            >
                {isFullscreen ? '📉 Thoát Toàn Màn Hình' : '⛶ Toàn Màn Hình'}
            </button>
        </div>
    );
};

export default TourActionToolbar;
