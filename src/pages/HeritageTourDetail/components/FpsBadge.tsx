import React, { useEffect, useState } from 'react';

export interface FpsBadgeProps {
    fps?: number;
    frameTimeMs?: number;
    showFrameTime?: boolean;
    className?: string;
}

export const FpsBadge: React.FC<FpsBadgeProps> = ({
    fps: propFps,
    frameTimeMs: propFrameTimeMs,
    showFrameTime = true,
    className = '',
}) => {
    const [internalMetrics, setInternalMetrics] = useState<{ fps: number; frameTimeMs: number }>({
        fps: propFps ?? 0,
        frameTimeMs: propFrameTimeMs ?? 0,
    });

    useEffect(() => {
        if (propFps !== undefined && propFrameTimeMs !== undefined) {
            setInternalMetrics({ fps: propFps, frameTimeMs: propFrameTimeMs });
            return;
        }

        const handleMetricUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<{ fps: number; frameTimeMs: number }>;
            if (customEvent.detail) {
                setInternalMetrics(customEvent.detail);
            }
        };

        window.addEventListener('fps-metric-update', handleMetricUpdate);
        return () => window.removeEventListener('fps-metric-update', handleMetricUpdate);
    }, [propFps, propFrameTimeMs]);

    const fps = propFps !== undefined ? propFps : internalMetrics.fps;
    const frameTimeMs = propFrameTimeMs !== undefined ? propFrameTimeMs : internalMetrics.frameTimeMs;

    // Xác định màu trạng thái dựa trên mức FPS
    const getStatusColor = (currentFps: number) => {
        if (currentFps >= 50) {
            return {
                bg: 'bg-emerald-500/15',
                border: 'border-emerald-500/30',
                text: 'text-emerald-400',
                dot: 'bg-emerald-400',
            };
        }
        if (currentFps >= 30) {
            return {
                bg: 'bg-amber-500/15',
                border: 'border-amber-500/30',
                text: 'text-amber-400',
                dot: 'bg-amber-400',
            };
        }
        return {
            bg: 'bg-rose-500/15',
            border: 'border-rose-500/30',
            text: 'text-rose-400',
            dot: 'bg-rose-400',
        };
    };

    const status = getStatusColor(fps);

    return (
        <div
            className={`backdrop-blur-md px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] transition-colors duration-200 pointer-events-auto select-none ${status.bg} ${status.border} ${status.text} ${className}`}
            title={`Tốc độ khung hình: ${fps} FPS | Độ trễ: ${frameTimeMs}ms`}
        >
            <span className={`w-2 h-2 rounded-full animate-pulse ${status.dot}`} />
            <div className="flex items-center gap-1.5 font-semibold">
                <span>{fps > 0 ? fps : '--'} FPS</span>
                {showFrameTime && (
                    <span className="text-slate-400 font-normal border-l border-white/10 pl-1.5 text-[11px]">
                        {frameTimeMs > 0 ? `${frameTimeMs}ms` : '--'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default FpsBadge;
