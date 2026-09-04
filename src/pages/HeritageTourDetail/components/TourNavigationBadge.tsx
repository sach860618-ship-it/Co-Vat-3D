import React from 'react';
import { Link } from 'react-router-dom';
import { CulturalDestinationModel } from '../../../models/Destination/CulturalDestinationModel';

export interface TourNavigationBadgeProps {
    destination: CulturalDestinationModel;
}

export const TourNavigationBadge: React.FC<TourNavigationBadgeProps> = ({ destination }) => {
    const destinationId = destination.id;
    return (
        <div className="flex items-center gap-3 bg-slate-900/75 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] pointer-events-auto">
            <Link
                to={destinationId ? `/heritage-tour?id=${destinationId}` : '/heritage-tour'}
                state={{ selectedId: destinationId }}
                className="text-slate-400 hover:text-sky-400 no-underline flex items-center gap-1.5 font-medium text-sm transition-colors duration-200"
            >
                <span>&larr;</span> Danh sách
            </Link>

            <span className="w-px h-[18px] bg-white/20" />

            <h1 className="m-0 text-[1.15rem] font-semibold text-slate-50">
                {destination.name}
            </h1>

            <span className="bg-sky-400/15 text-sky-400 border border-sky-400/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {destination.status}
            </span>
        </div>
    );
};

export default TourNavigationBadge;
