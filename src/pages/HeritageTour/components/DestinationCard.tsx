import React from 'react';
import { CulturalDestinationModel } from '../../../models/Destination/CulturalDestinationModel';
import DestinationStatus from '../../../models/Destination/DestinationStatus';

export interface DestinationCardProps {
  item: CulturalDestinationModel;
  isSelected: boolean;
  onSelect: (destination: CulturalDestinationModel) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const isAvailable = item.status === DestinationStatus.AVAILABLE;

  const getCardStatusClass = () => {
    const baseClass =
      'w-full px-4 py-3 rounded-2xl border-[1.5px] transition-all duration-250 ease-out text-left block outline-none';

    if (!isAvailable) {
      return `${baseClass} opacity-55 bg-white/30 border-dashed border-white/40 cursor-not-allowed`;
    }

    if (isSelected) {
      return `${baseClass} bg-red-50/80 border-[#d32f2f] shadow-lg hover:bg-white/95 -translate-y-0.5 cursor-pointer`;
    }

    return `${baseClass} bg-white/40 border-white/60 hover:bg-white/65 hover:-translate-y-0.5 hover:shadow-md cursor-pointer`;
  };

  const handleSelectDestination = () => {
    if (isAvailable) {
      onSelect(item);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSelectDestination}
      disabled={!isAvailable}
      className={getCardStatusClass()}
    >
      <div className="flex items-center gap-4 flex-nowrap">
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-[52px] h-[52px] rounded-[10px] object-cover border border-black/10 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 truncate">
            {item.name}
          </div>
          {isAvailable ? (
            <span className="text-xs text-[#d32f2f] font-bold">Available</span>
          ) : (
            <span className="text-xs text-gray-600 font-semibold">Coming soon</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default DestinationCard;
