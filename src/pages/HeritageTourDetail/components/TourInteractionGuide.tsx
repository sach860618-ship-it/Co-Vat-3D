import React from 'react';

export const TourInteractionGuide: React.FC = () => {
    return (
        <div className="bg-slate-900/80 backdrop-blur-md text-slate-50 px-4 py-3 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-xs pointer-events-auto">
            <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">✨</span>
                <strong className="text-sky-400 text-sm font-bold">Hướng dẫn tương tác:</strong>
            </div>
            <div className="flex flex-col gap-1 text-slate-300">
                <div>• <strong className="text-slate-50">W, A, S, D</strong>: Di chuyển nhân vật</div>
                <div>• <strong className="text-slate-50">Kéo chuột</strong>: Xoay góc nhìn 360°</div>
                <div>• <strong className="text-slate-50">Cuộn chuột</strong>: Phóng to / Thu nhỏ</div>
                <div>• <strong className="text-sky-400">Click cổ vật</strong>: Xem chi tiết 3D & Audio</div>
                <div className="border-t border-white/10 pt-1 mt-0.5">
                    <div>• <strong className="text-amber-400">Phím B</strong>: Thả quả bóng mới</div>
                    <div>• <strong className="text-amber-400">Chạm bóng</strong>: Đi bộ đẩy bóng lăn</div>
                    <div>• <strong className="text-amber-400">Phím F / Click bóng</strong>: Sút bóng bay xa</div>
                </div>
            </div>
        </div>
    );
};

export default TourInteractionGuide;
