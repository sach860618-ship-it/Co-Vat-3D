import React, { Component } from 'react';

export interface DestinationOptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    name: string;
    artifactCount: number;
    selected: boolean;
}

export class DestinationOptionButton extends Component<DestinationOptionButtonProps> {
    render() {
        const { name, artifactCount, selected, className = '', ...restProps } = this.props;

        return (
            <button
                type="button"
                className={`w-full py-2.5 px-3 rounded-xl font-medium text-xs text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${selected
                    ? 'bg-[#c70b0b] text-white font-semibold shadow-sm'
                    : 'bg-[#353230] text-neutral-300 hover:bg-[#3f3b39]'
                    } ${className}`}
                {...restProps}
            >
                <span>{name}</span>
                <span className="text-[10px] opacity-75">({artifactCount} cổ vật)</span>
            </button>
        );
    }
}

export default DestinationOptionButton;