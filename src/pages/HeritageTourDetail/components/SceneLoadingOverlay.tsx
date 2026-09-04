import React from 'react';

export interface SceneLoadingOverlayProps {
    destinationName?: string;
    loadingProgress: number;
    loadingItemText: string;
}

export const SceneLoadingOverlay: React.FC<SceneLoadingOverlayProps> = ({
    destinationName,
    loadingProgress,
    loadingItemText,
}) => {
    return (
        <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle_at_center,#0f172a_0%,#080b12_100%)] flex flex-col items-center justify-center z-[9999] text-slate-50">
            <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                <div className="absolute inset-0 w-full h-full border-[3px] border-sky-400/15 border-t-sky-400 rounded-full animate-spin" />
                <span className="text-[2.2rem]">🏛️</span>
            </div>
            <h3 className="m-0 mb-1.5 text-[1.3rem] font-semibold text-slate-50 tracking-[0.5px]">
                Đang khởi tạo không gian di sản 3D...
            </h3>
            <p className="m-0 mb-5 text-[0.95rem] text-sky-400 font-medium">
                {destinationName || 'Vui lòng chờ trong giây lát'}
            </p>

            {/* Dynamic Loading Progress Bar */}
            <div className="w-[280px] bg-white/10 rounded-[10px] h-2 overflow-hidden border border-sky-400/20">
                <div
                    style={{ width: `${loadingProgress}%` }}
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-[width] duration-200 ease-out rounded-[10px]"
                />
            </div>
            <div className="mt-2.5 flex justify-between w-[280px] text-xs text-slate-400">
                <span className="truncate max-w-[210px]">{loadingItemText}</span>
                <span className="font-semibold text-sky-400">{loadingProgress}%</span>
            </div>
        </div>
    );
};

export default SceneLoadingOverlay;
