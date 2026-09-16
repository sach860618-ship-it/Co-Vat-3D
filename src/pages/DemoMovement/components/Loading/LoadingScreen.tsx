// PREVIEW ONLY: Loading.tsx (hoặc Loading.jsx)
import React from 'react';

interface LoadingProps {
    progress: number;   // % chạy (0 - 100)
    stage: string;      // Tiến trình chạy chi tiết
}

export default function LoadingScreen({
    progress = 0,
    stage = ''
}: LoadingProps) {
    const percent = Math.min(Math.max(Math.round(progress), 0), 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdfbf7] select-none">
            {/* Vòng họa tiết chìm giả lập mặt trống đồng */}
            <div className="absolute w-[600px] h-[600px] rounded-full border-[18px] border-amber-900/5 flex items-center justify-center pointer-events-none">
                <div className="w-[450px] h-[450px] rounded-full border-[6px] border-dashed border-amber-900/10 flex items-center justify-center">
                    <div className="w-[300px] h-[300px] rounded-full border border-amber-900/10" />
                </div>
            </div>

            {/* Card loading chính */}
            <div className="relative z-10 w-80 bg-white rounded-2xl px-6 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col items-center">
                {/* Chữ */}
                <p className="text-red-700 font-bold text-xs tracking-[0.25em] uppercase mb-4">
                    Đang tải...
                </p>

                {/* Thanh tiến trình chạy */}
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {/* % chạy */}
                <span className="text-xs text-gray-500 font-medium mt-2.5">
                    {percent}%
                </span>

                {/* Tiến trình chạy (nếu có) */}
                {stage && (
                    <span className="text-[11px] text-gray-400 mt-1 truncate max-w-full">
                        {stage}
                    </span>
                )}
            </div>
        </div>
    );
}