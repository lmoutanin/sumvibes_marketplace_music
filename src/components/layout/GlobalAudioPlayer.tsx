"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Music, Play, Pause, Heart, ShoppingCart, Volume2, VolumeX, ChevronDown
} from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LicensePickerModal } from "@/components/catalogue/LicensePickerModal";
import { resolveFileUrl } from "@/lib/resolve-file";


function formatDuration(secs?: number | null) {
    if (!secs || isNaN(secs) || !isFinite(secs)) return "0:00";
    return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
}

export function GlobalAudioPlayer() {
    const {
        activeBeat, isPlaying, isBuffering,
        progress, currentTime, duration,
        volume, isMuted,
        togglePlayPause, seek, setVolume, toggleMute, close,
    } = useAudioPlayer();

    const { user } = useAuth();
    const { addToCart } = useCart();
    const [liked, setLiked] = useState(false);
    const [licenseTarget, setLicenseTarget] = useState<any>(null);
    const pathname = usePathname();

    if (!activeBeat) return null;

    // Hide on catalogue which has its own integrated player
    if (pathname?.startsWith("/catalogue")) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 glass z-50 border-t border-brand-gold/10 backdrop-blur-xl bg-[#020c1b]/95 animate-in slide-in-from-bottom-5">
                <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between h-20">

                    {/* Left: cover + info */}
                    <div className="flex items-center gap-3 w-1/3 min-w-[200px]">
                        <div className="w-14 h-14 rounded-md bg-white/5 overflow-hidden relative flex-shrink-0 shadow-lg group">
                            {activeBeat.coverImage
                                ? <Image src={resolveFileUrl(activeBeat.coverImage)} alt="cover" fill sizes="56px" className="object-cover" />
                                : <Music className="w-6 h-6 m-auto absolute inset-0 text-white/30" />}
                            {/* Close on hover */}
                            <div
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                onClick={close}
                            >
                                <ChevronDown className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <Link
                                href={`/product/${activeBeat.slug}`}
                                className="font-bold text-sm truncate hover:underline hover:text-brand-gold block"
                            >
                                {activeBeat.title}
                            </Link>
                            {activeBeat.seller && (
                                <Link
                                    href={`/producers/${activeBeat.seller.id}`}
                                    className="block text-xs text-slate-400 hover:text-white hover:underline truncate mt-0.5"
                                >
                                    {activeBeat.seller.displayName || activeBeat.seller.username}
                                </Link>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!user) return;
                                const token = localStorage.getItem("token");
                                if (!token) return;
                                const newLiked = !liked;
                                setLiked(newLiked);
                                try {
                                    await fetch("/api/favorites", {
                                        method: newLiked ? "POST" : "DELETE",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ beatId: activeBeat.id }),
                                    });
                                } catch { setLiked(!newLiked); }
                            }}
                            className={`ml-2 p-1.5 rounded-lg transition-colors flex-shrink-0 ${liked ? "text-rose-400" : "text-slate-500 hover:text-white"}`}
                        >
                            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                        </button>
                    </div>

                    {/* Center: play + progress */}
                    <div className="flex flex-col items-center justify-center gap-1.5 w-1/3 max-w-[600px]">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={togglePlayPause}
                                className="w-8 h-8 rounded-full bg-white hover:scale-105 text-black flex items-center justify-center transition-transform"
                            >
                                {isBuffering
                                    ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" />
                                    : isPlaying
                                        ? <Pause className="w-4 h-4 fill-current" />
                                        : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-3 w-full text-[11px] text-slate-400 font-medium">
                            <span className="w-8 text-right">{formatDuration(currentTime)}</span>
                            <div className="relative flex-1 h-1 bg-white/10 rounded-none group flex items-center cursor-pointer">
                                <input
                                    type="range" min="0" max="100" step="0.1"
                                    value={progress}
                                    onChange={(e) => seek(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="h-full bg-white group-hover:bg-brand-gold transition-colors rounded-none"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                                </div>
                            </div>
                            <span className="w-8 text-left">{formatDuration(duration)}</span>
                        </div>
                    </div>

                    {/* Right: volume + price + cart */}
                    <div className="w-[30%] min-w-[200px] flex justify-end gap-6 items-center">
                        <div className="flex items-center gap-2 group w-32">
                            <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <div className="relative flex-1 h-1.5 bg-white/10 rounded-none flex items-center">
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="h-full bg-slate-300 group-hover:bg-brand-gold transition-colors rounded-none"
                                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="h-6 w-px bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="text-xs font-bold text-brand-gold hidden sm:block">
                                {Number(activeBeat.basicPrice ?? 0).toFixed(2)}€
                            </div>
                            {user?.id !== activeBeat.seller?.id && (
                                <button
                                    onClick={() => setLicenseTarget(activeBeat)}
                                    className="btn-primary p-2 rounded-lg text-xs font-semibold flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* License selection modal - outside stacking context */}
            <LicensePickerModal
                beat={licenseTarget}
                onClose={() => setLicenseTarget(null)}
                onAdd={addToCart}
                isPlaying={activeBeat?.id === licenseTarget?.id && isPlaying}
                onTogglePlay={togglePlayPause}
            />
        </>
    );
}
