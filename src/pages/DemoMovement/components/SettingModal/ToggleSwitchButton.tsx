interface ToggleSwitchButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    enable: boolean;
}

export const ToggleSwitchButton: React.FC<ToggleSwitchButtonProps> = (
    props
) => {
    const { enable } = props;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={enable}
            onClick={props.onClick}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enable ? 'bg-[#c70b0b]' : 'bg-[#3b3836]'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${enable ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
};