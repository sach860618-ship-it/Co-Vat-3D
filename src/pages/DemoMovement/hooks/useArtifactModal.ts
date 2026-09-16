import { useState, useRef, useCallback, useEffect } from 'react';
import { ArtifactInfo } from '../../../models/Artifact';

export const useArtifactModal = <T = ArtifactInfo>(closeDelayMs: number = 300) => {
    const [selectedArtifact, setSelectedArtifact] = useState<T | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Tự động hủy timer khi component unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Mở modal và hủy tiến trình đóng đang chờ (nếu có)
    const openModal = useCallback((artifact: T) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsClosing(false);
        setSelectedArtifact(artifact);
    }, []);

    // Đóng modal với hiệu ứng animation trượt (delay 300ms)
    const closeModal = useCallback(() => {
        if (isClosing || !selectedArtifact) return;
        setIsClosing(true);
        timerRef.current = setTimeout(() => {
            setSelectedArtifact(null);
            setIsClosing(false);
        }, closeDelayMs);
    }, [isClosing, selectedArtifact, closeDelayMs]);

    return {
        selectedArtifact,
        isClosing,
        openModal,
        closeModal,
    };
};
