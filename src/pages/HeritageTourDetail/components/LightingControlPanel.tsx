import React from 'react';

export type LightPreset = 'museum' | 'daylight' | 'sunset' | 'neon';

export interface LightingTheme {
    name: string;
    icon: string;
    skyColor: number;
    groundColor: number;
    ambientColor: number;
    ambientIntensity: number;
    keyColor: number;
    keyIntensity: number;
    fillColor: number;
    fillIntensity: number;
    rimColor: number;
    rimIntensity: number;
    bgColor: number;
    fogColor: number;
}

export const LIGHT_PRESETS: Record<LightPreset, LightingTheme> = {
    museum: {
        name: 'Bảo Tàng Đêm',
        icon: '🏛️',
        skyColor: 0x38bdf8,
        groundColor: 0x0f172a,
        ambientColor: 0xffffff,
        ambientIntensity: 0.8,
        keyColor: 0xffffff,
        keyIntensity: 1.8,
        fillColor: 0x38bdf8,
        fillIntensity: 1.2,
        rimColor: 0xc084fc,
        rimIntensity: 0.9,
        bgColor: 0x080b12,
        fogColor: 0x080b12,
    },
    daylight: {
        name: 'Ban Ngày Rực Rỡ',
        icon: '☀️',
        skyColor: 0xbae6fd,
        groundColor: 0x334155,
        ambientColor: 0xffffff,
        ambientIntensity: 1.5,
        keyColor: 0xfffbeb,
        keyIntensity: 2.5,
        fillColor: 0xe0f2fe,
        fillIntensity: 1.6,
        rimColor: 0xbfdbfe,
        rimIntensity: 1.2,
        bgColor: 0x0f172a,
        fogColor: 0x0f172a,
    },
    sunset: {
        name: 'Hoàng Hôn Ấm Áp',
        icon: '🌅',
        skyColor: 0xfdba74,
        groundColor: 0x1e1b4b,
        ambientColor: 0xffedd5,
        ambientIntensity: 1.1,
        keyColor: 0xf97316,
        keyIntensity: 2.4,
        fillColor: 0xa855f7,
        fillIntensity: 1.4,
        rimColor: 0xfde047,
        rimIntensity: 1.3,
        bgColor: 0x180e29,
        fogColor: 0x180e29,
    },
    neon: {
        name: 'Cyber Neon',
        icon: '🔮',
        skyColor: 0x06b6d4,
        groundColor: 0x3b0764,
        ambientColor: 0xe0e7ff,
        ambientIntensity: 0.9,
        keyColor: 0xec4899,
        keyIntensity: 2.5,
        fillColor: 0x3b82f6,
        fillIntensity: 1.8,
        rimColor: 0x22c55e,
        rimIntensity: 1.4,
        bgColor: 0x090514,
        fogColor: 0x090514,
    },
};

export interface LightingControlPanelProps {
    onClose: () => void;
    lightMode: LightPreset;
    setLightMode: (mode: LightPreset) => void;
    lightIntensity: number;
    setLightIntensity: (val: number) => void;
}

export const LightingControlPanel: React.FC<LightingControlPanelProps> = ({
    onClose,
    lightMode,
    setLightMode,
    lightIntensity,
    setLightIntensity,
}) => {
    return (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-[20px] p-5 shadow-[0_12px_40px_0_rgba(0,0,0,0.6)] text-slate-50 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-[1.05rem] font-bold flex items-center gap-2 text-sky-400">
                    💡 Điều Chỉnh Ánh Sáng 3D
                </h3>
                <button
                    onClick={onClose}
                    className="bg-transparent border-none text-slate-400 hover:text-white cursor-pointer text-lg"
                >
                    ✕
                </button>
            </div>

            {/* Preset Selector */}
            <div className="mb-4.5">
                <label className="text-xs uppercase text-slate-400 font-bold tracking-[0.5px]">
                    Chế độ ánh sáng
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {(Object.keys(LIGHT_PRESETS) as LightPreset[]).map((key) => {
                        const preset = LIGHT_PRESETS[key];
                        const isActive = lightMode === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setLightMode(key)}
                                className={`p-2 rounded-xl cursor-pointer text-xs font-semibold text-left flex items-center gap-1.5 transition-all duration-200 border ${
                                    isActive
                                        ? 'bg-sky-400/20 border-sky-400 text-sky-400'
                                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                }`}
                            >
                                <span>{preset.icon}</span>
                                <span>{preset.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Intensity Slider */}
            <div>
                <div className="flex justify-between mb-1.5 text-xs">
                    <span className="text-slate-300 font-medium">Độ sáng không gian:</span>
                    <span className="text-sky-400 font-bold">{Math.round(lightIntensity * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default LightingControlPanel;
