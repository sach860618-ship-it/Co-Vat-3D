import React from 'react';

export interface ArtifactPlaceholderCardProps {
    artifactName: string;
    percent: number;
    isWarning: boolean;
    onRetry?: () => void;
}

export const ArtifactWarningCard: React.FC<{
    artifactName: string;
    onRetry?: () => void;
}> = ({ artifactName, onRetry }) => {
    const displayName =
        artifactName.length > 18 ? `${artifactName.slice(0, 18)}...` : artifactName;

    return (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-950/95 border border-amber-500/80 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <div className="flex flex-col">
                <span className="truncate max-w-[110px] text-amber-100 font-bold">
                    {displayName}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">
                    ⚠️ Lỗi nạp mô hình
                </span>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRetry?.();
                }}
                className="flex items-center gap-1 bg-amber-500/25 hover:bg-amber-500/45 active:scale-95 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/50 cursor-pointer transition-all shadow-sm"
            >
                <span className="text-[11px] font-semibold">Thử lại</span> 🔄
            </button>
        </div>
    );
};

export const ArtifactLoadingCard: React.FC<{
    artifactName: string;
    percent: number;
}> = ({ artifactName, percent }) => {
    const pct = Math.min(100, Math.max(0, Math.round(percent)));
    const displayName =
        artifactName.length > 18 ? `${artifactName.slice(0, 18)}...` : artifactName;

    return (
        <div className="flex flex-col gap-1.5 px-3.5 py-2.5 min-w-[170px] rounded-xl bg-slate-900/90 border border-sky-500/40 backdrop-blur-md shadow-2xl text-white">
            <div className="flex justify-between items-center text-xs font-semibold gap-3">
                <span className="truncate max-w-[110px] text-slate-100">{displayName}</span>
                <span className="text-sky-400 font-mono font-bold text-xs">{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-150 rounded-full"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

export const ArtifactPlaceholderCard: React.FC<ArtifactPlaceholderCardProps> = ({
    artifactName,
    percent,
    isWarning,
    onRetry,
}) => {
    if (isWarning) {
        return <ArtifactWarningCard artifactName={artifactName} onRetry={onRetry} />;
    }
    return <ArtifactLoadingCard artifactName={artifactName} percent={percent} />;
};
