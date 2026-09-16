import React from 'react';

export interface BackgroundAssetStatus {
    total: number;
    loaded: number;
    currentName: string;
    isComplete: boolean;
}

export const ArtifactLoadingBadge: React.FC<{ status: BackgroundAssetStatus }> = ({ status }) => {
    if (status.total === 0 || status.isComplete) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/85 backdrop-blur-md border border-sky-500/30 rounded-full shadow-lg text-slate-100 text-xs transition-all">
            <div className="w-4 h-4 border-2 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
            <div className="flex flex-col">
                <span className="font-semibold text-sky-400">
                    Đang nạp hiện vật ({status.loaded}/{status.total})
                </span>
                <span className="text-[11px] text-slate-400 max-w-[200px] truncate">
                    {status.currentName || 'Chuẩn bị hiển thị...'}
                </span>
            </div>
        </div>
    );
};