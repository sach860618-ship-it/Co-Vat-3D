import { useState, useEffect, useCallback, RefObject } from 'react';

export const useFullscreen = (targetRef?: RefObject<HTMLElement | null>) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const toggleFullscreen = useCallback(() => {
        const element = targetRef?.current || document.documentElement;
        if (!document.fullscreenElement) {
            element.requestFullscreen().catch((err) => {
                console.error('Không thể bật fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch((err) => {
                console.error('Không thể thoát fullscreen:', err);
            });
        }
    }, [targetRef]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return { isFullscreen, toggleFullscreen };
};
