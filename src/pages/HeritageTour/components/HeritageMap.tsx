import React from 'react';
import { CulturalDestinationModel } from '../../../models/Destination/CulturalDestinationModel';

export interface HeritageMapProps {
  selectedDestination: CulturalDestinationModel;
}

export const HeritageMap: React.FC<HeritageMapProps> = ({ selectedDestination }) => {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden relative min-h-[440px] h-full flex flex-col shadow-xl border border-white/80">
      {/* Top Right Pill Badge Button */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <button
          type="button"
          className="bg-[#fcf4ed]/90 hover:bg-white text-[#5d4037] border border-[#8d6e63]/35 rounded-full py-1.5 px-4.5 text-xs font-bold tracking-[0.5px] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer outline-none"
        >
          BẢN ĐỒ DI SẢN SỐ 3D
        </button>
      </div>

      {/* Interactive Isometric Map Image Representation */}
      <div className="flex-1 relative overflow-hidden">
        <img
          src={selectedDestination.thumbnail}
          alt="3D Heritage Map"
          className="w-full h-full object-cover brightness-95 contrast-105"
        />

        {/* Map Overlay Graphic & Pins */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
          <span className="self-start bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md mb-2 shadow-sm uppercase tracking-wide">
            {selectedDestination.name}
          </span>
          <p className="text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
            {selectedDestination.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeritageMap;
