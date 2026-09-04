import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseSceneLoadingOptions {
    safetyTimeoutMs?: number; // Mặc định 10s tự đóng nếu nạp quá lâu
    finishDelayMs?: number;   // Mặc định 1s để hiển thị mốc 100%
}

export const useSceneLoading = (options: UseSceneLoadingOptions = {}) => {
    const { safetyTimeoutMs = 10000, finishDelayMs = 1000 } = options;

    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [loadingItemText, setLoadingItemText] = useState<string>('Đang khởi tạo...');

    const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Dọn dẹp timer để tránh rò rỉ bộ nhớ
    const clearAllTimers = useCallback(() => {
        if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    }, []);

    useEffect(() => {
        return () => clearAllTimers();
    }, [clearAllTimers]);

    // Bắt đầu quá trình nạp
    const startLoading = useCallback((initialText: string = 'Đang khởi tạo...') => {
        clearAllTimers();
        setPageLoading(true);
        setLoadingProgress(0);
        setLoadingItemText(initialText);

        if (safetyTimeoutMs > 0) {
            safetyTimerRef.current = setTimeout(() => {
                setPageLoading(false);
            }, safetyTimeoutMs);
        }
    }, [clearAllTimers, safetyTimeoutMs]);

    // Cập nhật % và mô tả đang tải
    const updateProgress = useCallback((progress: number, itemText?: string) => {
        setLoadingProgress(Math.min(100, Math.max(0, progress)));
        if (itemText) {
            setLoadingItemText(itemText);
        }
    }, []);

    // Báo hoàn tất: lên 100% rồi delay đóng màn hình
    const completeLoading = useCallback((completedText: string = 'Sẵn sàng!') => {
        setLoadingProgress(100);
        setLoadingItemText(completedText);

        finishTimerRef.current = setTimeout(() => {
            setPageLoading(false);
        }, finishDelayMs);
    }, [finishDelayMs]);

    // Đóng màn hình chờ ngay lập tức (dùng khi hủy hoặc lỗi nghiêm trọng)
    const stopLoading = useCallback(() => {
        clearAllTimers();
        setPageLoading(false);
    }, [clearAllTimers]);

    return {
        pageLoading,
        loadingProgress,
        loadingItemText,
        startLoading,
        updateProgress,
        completeLoading,
        stopLoading,
        setPageLoading,
    };
};