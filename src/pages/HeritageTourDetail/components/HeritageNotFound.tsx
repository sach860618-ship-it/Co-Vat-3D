import React from 'react';
import { Link } from 'react-router-dom';

export interface HeritageNotFoundProps {
    id?: string;
}

export const HeritageNotFound: React.FC<HeritageNotFoundProps> = ({ id }) => {
    return (
        <div className="min-h-screen bg-[#080b12] text-white flex flex-col items-center justify-center font-sans">
            <h2 className="text-xl font-bold mb-2">Không tìm thấy địa điểm di sản!</h2>
            <p className="text-slate-400 mb-4">
                ID: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-400">{id}</code>
            </p>
            <Link
                to={id ? `/heritage-tour?id=${id}` : '/heritage-tour'}
                state={{ selectedId: id }}
                className="text-sky-400 hover:underline"
            >
                &larr; Quay lại danh sách
            </Link>
        </div>
    );
};

export default HeritageNotFound;
