import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAudioPlayerReturn {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    progress: number;
    formattedCurrentTime: string;
    formattedDuration: string;
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
    seek: (percentage: number) => void;
    setVolume: (vol: number) => void;
}

const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const useAudioPlayer = (audioUrl?: string): UseAudioPlayerReturn => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    useEffect(() => {
        if (!audioUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            return;
        }

        const audio = new Audio(encodeURI(audioUrl));
        audioRef.current = audio;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audioRef.current = null;
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        };
    }, [audioUrl]);

    const play = useCallback(() => {
        audioRef.current?.play().catch((err) => {
            console.warn('Không thể phát âm thanh tự động:', err);
        });
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((err) => {
                console.warn('Lỗi phát âm thanh:', err);
            });
        }
    }, [isPlaying]);

    const seek = useCallback((percentage: number) => {
        if (!audioRef.current || !duration) return;
        const targetTime = (percentage / 100) * duration;
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
    }, [duration]);

    const setVolume = useCallback((vol: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, vol));
        }
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return {
        isPlaying,
        currentTime,
        duration,
        progress,
        formattedCurrentTime: formatTime(currentTime),
        formattedDuration: formatTime(duration),
        togglePlay,
        play,
        pause,
        seek,
        setVolume,
    };
};

export default useAudioPlayer;