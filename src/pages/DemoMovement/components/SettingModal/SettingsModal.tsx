import React from 'react';
import { culturalDestinationsData } from '../../../../models/Destination/CulturalDestinationModel';
import { ViewMode } from '../../model/ViewMode';
import { ToggleSwitchButton } from './ToggleSwitchButton';
import { OptionButton } from './OptionButton';
import DestinationOptionButton from './DestinationOptionButton';

export { ViewMode };
export type ControlMode = 'keyboard' | 'joystick';




interface SettingCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const SettingCard = ({
    title,
    description,
    children,
}: SettingCardProps) => {
    return (
        <div className="bg-[#2a2725]/75 border border-white/10 rounded-2xl p-4 space-y-3">
            <div>
                <div className="text-sm font-semibold text-white">
                    {title}
                </div>
                <div className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                    {description}
                </div>
            </div>
            {children}
        </div>
    );
};




export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    soundEnabled?: boolean;
    onSoundToggle?: (enabled: boolean) => void;
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
    controlMode?: ControlMode;
    onControlModeChange?: (mode: ControlMode) => void;
    selectedDestinationId?: string;
    onSelectDestination?: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    soundEnabled = true,
    onSoundToggle,
    viewMode = ViewMode.FirstPerson,
    onViewModeChange,
    controlMode = 'keyboard',
    onControlModeChange,
    selectedDestinationId,
    onSelectDestination,
}) => {
    if (!isOpen) return null;

    const handleToggleSound = () => {
        onSoundToggle?.(!soundEnabled);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[430px] bg-[#1c1a19]/95 text-white border border-white/10 rounded-[28px] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#2a2725] hover:bg-[#383432] border border-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer active:scale-95"
                    title="Đóng"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-white">Cài đặt</h2>
                    <p className="text-xs text-neutral-400 mt-1">Tùy chỉnh trải nghiệm trong scene 3D</p>
                </div>

                <div className="space-y-3.5">
                    {/* 1. Âm thanh hiệu ứng */}
                    <SettingCard title='Âm thanh hiệu ứng' description='Chào mừng, hover object, mở modal vật thể'>
                        <ToggleSwitchButton enable={soundEnabled} onClick={handleToggleSound} />
                    </SettingCard>

                    {/* 2. Góc nhìn */}
                    <SettingCard title='Góc nhìn' description='Thứ ba theo sau nhân vật hoặc thứ nhất'>
                        <div className="grid grid-cols-2 gap-2.5">
                            <OptionButton
                                label="Thứ 1"
                                selected={viewMode === ViewMode.FirstPerson}
                                onClick={() => onViewModeChange?.(ViewMode.FirstPerson)}
                            />
                            <OptionButton
                                label="Thứ 3"
                                selected={viewMode === ViewMode.ThirdPerson}
                                onClick={() => onViewModeChange?.(ViewMode.ThirdPerson)}
                            />
                        </div>
                    </SettingCard>
                    {/* 3. Điều khiển */}

                    <SettingCard title='Điều khiển (thứ nhất)' description='Chuột + Bàn phím: chuột xoay nhìn, WASD di chuyển. Joystick ảo: tiến/lùi/quay như góc nhìn thứ 3.'>
                        <div className="grid grid-cols-2 gap-2.5">
                            <OptionButton
                                label="Chuột + Bàn phím"
                                selected={controlMode === 'keyboard'}
                                onClick={() => onControlModeChange?.('keyboard')}
                            />
                            <OptionButton
                                label="Joystick ảo"
                                selected={controlMode === 'joystick'}
                                onClick={() => onControlModeChange?.('joystick')}
                            />
                        </div>
                    </SettingCard>

                    {/* 4. Địa điểm trưng bày cổ vật */}


                    <SettingCard title='Cổ vật địa điểm' description='Chọn bộ sưu tập di sản văn hóa muốn nạp vào không gian'>
                        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {culturalDestinationsData.map((dest) => (
                                <DestinationOptionButton
                                    key={dest.id}
                                    name={dest.name}
                                    artifactCount={dest.artifacts.length}
                                    selected={dest.id === selectedDestinationId}
                                    onClick={() => onSelectDestination?.(dest.id)}
                                />
                            ))}
                        </div>
                    </SettingCard>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
