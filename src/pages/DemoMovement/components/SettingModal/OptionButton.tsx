// OptionButton.tsx hoặc định nghĩa trực tiếp trong SettingsModal.tsx
import React, { Component } from 'react';

export interface OptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    selected: boolean;
}

export class OptionButton extends Component<OptionButtonProps> {
    render() {
        const { label, selected, onClick, className = '', ...restProps } = this.props;

        return (
            <button
                type="button"
                onClick={onClick}
                className={`py-2.5 px-3 rounded-xl font-medium text-xs text-center transition-all duration-200 cursor-pointer ${selected
                    ? 'bg-[#c70b0b] text-white shadow-sm font-semibold'
                    : 'bg-[#353230] text-neutral-300 hover:bg-[#3f3b39]'
                    } ${className}`}
                {...restProps}
            >
                {label}
            </button>
        );
    }
}