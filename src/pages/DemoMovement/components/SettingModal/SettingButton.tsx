import React from 'react';

export const SettingButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    const sizeClasses = 'w-10 h-10 rounded-xl';

    const iconSizes = 'w-5 h-5';

    return (
        <button
            type="button"
            onClick={props.onClick}
            className={`group relative flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 border select-none ${sizeClasses} ${'bg-gradient-to-b from-[#182033] to-[#121726] border-[#334266] hover:border-[#4d6499] text-white/90 hover:text-white shadow-[0_8px_20px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(66,133,244,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:from-[#1d273e] hover:to-[#141b2c]'
                } `}
        >
            <svg
                className={`${iconSizes} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:rotate-45`}
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.15 5.438a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l1.018.79a.4.4 0 01.127.428 7.54 7.54 0 000 1.136.4.4 0 01-.127.428l-1.018.79a1.875 1.875 0 00-.432 2.385l.922 1.597c.536.928 1.668 1.28 2.282.819l1.167-.452c.116-.043.284-.032.45.083.31.214.638.405.986.57.182.088.277.228.297.349l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.347-.164.675-.355.985-.57.167-.114.335-.125.45-.082l1.168.452c.614.46 1.746.109 2.282-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-1.018-.79a.4.4 0 01-.127-.428 7.538 7.538 0 000-1.136.4.4 0 01.127-.428l1.018-.79a1.875 1.875 0 00.432-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.819l-1.168.452c-.115.043-.283.032-.45-.083a7.488 7.488 0 00-.985-.57c-.183-.088-.277-.228-.297-.349l-.178-1.071A1.875 1.875 0 0012.922 2.25h-1.844zM12 9a3 3 0 100 6 3 3 0 000-6z"
                />
            </svg>
        </button>
    );
};

export default SettingButton;
