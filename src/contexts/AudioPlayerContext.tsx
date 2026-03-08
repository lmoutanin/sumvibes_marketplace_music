"use client";

import { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export interface AudioBeat {
    id: string;
    title: string;
    slug: string;
    mp3FileUrl?: string | null;
    previewUrl?: string | null;
    audioUrl?: string | null;
    coverImage?: string | null;
    basicPrice?: number;
    premiumPrice?: number;
    exclusivePrice?: number;
    seller?: {
        id: string;
        username: string;
        displayName?: string | null;
    };
}

interface AudioPlayerContextValue {
    activeBeat: AudioBeat | null;
    isPlaying: boolean;
    isBuffering: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playBeat: (beat: AudioBeat) => void;
    togglePlayPause: () => void;
    seek: (percent: number) => void;
    setVolume: (v: number) => void;
    toggleMute: () => void;
    close: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [activeBeat, setActiveBeat] = useState<AudioBeat | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const pathname = usePathname();

    // Stop audio on navigation
    useEffect(() => {
        close();
    }, [pathname]);

    // Init audio element once
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        const onTimeUpdate = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
        const onWaiting = () => setIsBuffering(true);
        const onCanPlay = () => setIsBuffering(false);
        const onPlaying = () => setIsBuffering(false);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("playing", onPlaying);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("playing", onPlaying);
            audio.pause();
            audio.src = "";
        };
    }, []);

    // Sync volume/mute
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const resolveUrl = (beat: AudioBeat): string | null => {
        const raw = beat.mp3FileUrl || beat.previewUrl || beat.audioUrl;
        if (!raw) return null;
        if (raw.startsWith("http") || raw.startsWith("/")) return raw;
        return `/uploads/beats/${raw}`;
    };

    const playBeat = useCallback((beat: AudioBeat) => {
        const audio = audioRef.current;
        if (!audio) return;
        const url = resolveUrl(beat);
        if (!url) return;

        if (activeBeat?.id === beat.id) {
            // Same beat — toggle
            if (isPlaying) { audio.pause(); setIsPlaying(false); }
            else { audio.play().then(() => setIsPlaying(true)).catch(() => { }); }
            return;
        }

        // New beat — load and play
        setIsBuffering(true);
        audio.src = url;
        audio.load();
        audio.play()
            .then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
                // Increment plays via API
                fetch(`/api/beats/${beat.slug}`, { method: 'POST' }).catch(() => { });
            })
            .catch(() => setIsBuffering(false));
        setActiveBeat(beat);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, [activeBeat, isPlaying]);

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !activeBeat) return;
        if (isPlaying) { audio.pause(); setIsPlaying(false); }
        else { audio.play().then(() => setIsPlaying(true)).catch(() => { }); }
    }, [activeBeat, isPlaying]);

    const seek = useCallback((percent: number) => {
        const audio = audioRef.current;
        if (!audio?.duration || !isFinite(audio.duration)) return;
        audio.currentTime = (percent / 100) * audio.duration;
        setProgress(percent);
    }, []);

    const setVolume = useCallback((v: number) => {
        setVolumeState(v);
        setIsMuted(v === 0);
        if (audioRef.current) audioRef.current.volume = v;
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(m => {
            if (audioRef.current) audioRef.current.volume = m ? volume : 0;
            return !m;
        });
    }, [volume]);

    const close = useCallback(() => {
        audioRef.current?.pause();
        audioRef.current && (audioRef.current.src = "");
        setActiveBeat(null);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, []);

    return (
        <AudioPlayerContext.Provider value={{
            activeBeat, isPlaying, isBuffering, progress, currentTime, duration,
            volume, isMuted, playBeat, togglePlayPause, seek, setVolume, toggleMute, close,
        }}>
            {children}
        </AudioPlayerContext.Provider>
    );
}

export function useAudioPlayer() {
    const ctx = useContext(AudioPlayerContext);
    if (!ctx) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
    return ctx;
}
