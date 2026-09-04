import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { culturalDestinationsData } from '../../models/Destination/CulturalDestinationModel';
import DestinationStatus from '../../models/Destination/DestinationStatus';
import DestinationCard from './components/DestinationCard';
import HeritageMap from './components/HeritageMap';

const HeritageTour: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Extract passed id from location state or search params
    const passedId = location.state?.selectedId || location.state?.id || searchParams.get('id');

    // Default to passed ID if valid, otherwise fallback to first item
    const getInitialId = () => {
        if (passedId) {
            const found = culturalDestinationsData.find((item) => item.id === passedId);
            if (found) return found.id;
        }
        return culturalDestinationsData[0]?.id || '';
    };

    const [selectedId, setSelectedId] = useState<string>(getInitialId);

    useEffect(() => {
        const currentPassedId = location.state?.selectedId || location.state?.id || searchParams.get('id');
        if (currentPassedId) {
            const found = culturalDestinationsData.find((item) => item.id === currentPassedId);
            if (found) {
                setSelectedId(found.id);
            }
        }
    }, [location.state, searchParams]);

    const selectedDestination = culturalDestinationsData.find((item) => item.id === selectedId) || culturalDestinationsData[0];
    const isSelectedAvailable = selectedDestination?.status === DestinationStatus.AVAILABLE;

    const handleExplore = () => {
        if (selectedDestination && isSelectedAvailable) {
            navigate(`/heritage-tour/${selectedDestination.id}`);
        }
    };

    const renderBackgroundPattern = () => {
        return (
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.08)_2px,transparent_2px)] bg-[size:32px_32px]" />
        );
    };

    const renderBrandHeader = () => {
        return (
            <div className="flex items-center justify-center gap-2.5 mb-6">
                <svg width="36" height="24" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 50L35 10L60 50H45L35 30L25 50H10Z" fill="#ffffff" />
                    <path d="M40 50L65 10L90 50H75L65 30L55 50H40Z" fill="#ffffff" opacity="0.85" />
                </svg>
                <h2 className="text-white font-extrabold tracking-[1.5px] text-xl font-sans m-0">
                    SAVA
                </h2>
                <span className="text-xs text-white/85 font-semibold tracking-[2px] block">
                    GOOD TO GREAT
                </span>
            </div>
        );
    };

    const renderWelcomeHeader = () => {
        return (
            <>
                <h2 className="text-center font-extrabold text-[#900000] leading-tight mb-2 uppercase tracking-[0.5px] text-xl md:text-2xl m-0">
                    KHÔNG GIAN VĂN HÓA SỐ VIỆT NAM
                </h2>

                <p className="text-center text-sm text-gray-800 mb-6 font-medium leading-relaxed">
                    Chào mừng bạn đến với không gian văn hóa số Việt Nam.<br />
                    Hãy chọn địa điểm bạn muốn thăm quan.
                </p>
            </>
        );
    };

    const renderExploreButton = () => {
        return (
            <button
                type="button"
                onClick={handleExplore}
                disabled={!isSelectedAvailable}
                className={`group w-full h-[52px] px-7 rounded-[14px] font-bold text-[1.05rem] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] border-none flex items-center justify-center gap-2 ${
                    isSelectedAvailable
                        ? 'bg-[#b70000] text-white shadow-[0_6px_18px_rgba(183,0,0,0.35)] hover:bg-[#930000] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(183,0,0,0.45)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(183,0,0,0.3)] cursor-pointer'
                        : 'bg-gray-400 text-white/80 cursor-not-allowed opacity-60'
                }`}
            >
                <span>{isSelectedAvailable ? 'Tham quan ngay' : 'Đang phát triển (Coming soon)'}</span>
                {isSelectedAvailable && (
                    <span className="inline-block transition-transform duration-250 ease-out group-hover:translate-x-1">→</span>
                )}
            </button>
        );
    };

    return (
        <div className="min-h-screen w-full relative flex flex-col items-center justify-center py-8 px-4 box-border overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#e53935_0%,#d32f2f_40%,#f57c00_85%,#ff9800_100%)]">
            {renderBackgroundPattern()}
            {renderBrandHeader()}

            {/* Main Translucent Glass Card */}
            <div className="bg-white/35 backdrop-blur-md border border-white/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[1050px] p-6 md:p-9 my-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Left Column: Selector & Details */}
                    <div className="md:col-span-5 flex flex-col justify-between h-full space-y-6">
                        <div>
                            {renderWelcomeHeader()}

                            {/* List of Destination Selector Card Buttons */}
                            <div className="space-y-3">
                                {culturalDestinationsData.map((item) => (
                                    <DestinationCard
                                        key={item.id}
                                        item={item}
                                        isSelected={item.id === selectedId}
                                        onSelect={(dest) => setSelectedId(dest.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Main CTA Primary Action Button */}
                        {renderExploreButton()}
                    </div>

                    {/* Right Column: Interactive Map Display */}
                    <div className="md:col-span-7">
                        <HeritageMap selectedDestination={selectedDestination} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeritageTour;
