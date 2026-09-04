import React from 'react';
import { CulturalDestinationModel } from '../../../models/Destination/CulturalDestinationModel';
import { useAudioPlayer } from '../../../hooks/useAudioPlayer';

export interface DestinationInfoDrawerProps {
    destination: CulturalDestinationModel;
    onClose: () => void;
}

export const DestinationInfoDrawer: React.FC<DestinationInfoDrawerProps> = ({
    destination,
    onClose,
}) => {
    const {
        isPlaying,
        togglePlay,
        progress,
        seek,
        formattedCurrentTime,
        formattedDuration,
    } = useAudioPlayer(destination.audioUrl);

    return (
        <div className="bg-slate-900/85 backdrop-blur-xl text-slate-50 p-5 rounded-[20px] border border-white/15 shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-300 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h2 className="m-0 text-[1.15rem] font-bold text-slate-50">
                    {destination.name}
                </h2>
                <button
                    onClick={onClose}
                    title="Ẩn thông tin"
                    className="bg-white/10 hover:bg-white/20 border-none text-slate-300 rounded-full w-6.5 h-6.5 flex items-center justify-center cursor-pointer text-sm"
                >
                    ✕
                </button>
            </div>

            <img
                src={destination.thumbnail}
                alt={destination.name}
                className="w-full h-[130px] object-cover rounded-xl border border-white/10"
            />

            <p className="m-0 text-xs leading-relaxed text-slate-300">
                {destination.description}
            </p>

            {/* DESTINATION AUDIO PLAYER */}
            {destination.audioUrl && (
                <div className="bg-white/[0.05] border border-white/10 rounded-xl p-2.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <span>🎧 Thuyết minh địa điểm</span>
                            {isPlaying && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            )}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                            {formattedCurrentTime} / {formattedDuration}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePlay}
                            title={isPlaying ? "Tạm dừng" : "Nghe thuyết minh"}
                            className="w-7 h-7 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-900 text-xs flex items-center justify-center font-bold shrink-0 border-0 cursor-pointer shadow-sm transition-all"
                        >
                            {isPlaying ? '❚❚' : '▶'}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={progress}
                            onChange={(e) => seek(Number(e.target.value))}
                            className="flex-1 accent-sky-400 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                    </div>
                </div>
            )}

            <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
                <div className="flex justify-between items-center">
                    <span>Trạng thái hoạt động:</span>
                    <span className="text-sky-400 font-semibold bg-sky-400/15 py-0.5 px-2 rounded-full text-[11px]">
                        ● {destination.status}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                    <span>Tổng số cổ vật 3D:</span>
                    <span className="text-amber-400 font-semibold">
                        {destination.artifacts?.length ?? 0} vật thể
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DestinationInfoDrawer;
