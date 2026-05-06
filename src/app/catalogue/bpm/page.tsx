"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";
import { ChevronLeft, Play, Pause, ShoppingCart, Heart, Clock, Music } from "lucide-react";
import { resolveFileUrl } from "@/lib/resolve-file";
import { useBeats } from "@/hooks/useBeats";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { LicensePickerModal } from "@/components/catalogue/LicensePickerModal";

const bpmRangesBase = [
  { id: "60-80", label: "60-80 BPM", description: "Ballades, Lo-Fi, Chill", min: 60, max: 79 },
  { id: "80-100", label: "80-100 BPM", description: "R&B, Soul, Reggaeton", min: 80, max: 99 },
  { id: "100-120", label: "100-120 BPM", description: "Pop, Dancehall, Afrobeat", min: 100, max: 119 },
  { id: "120-140", label: "120-140 BPM", description: "House, Électro, Dance", min: 120, max: 139 },
  { id: "140-160", label: "140-160 BPM", description: "Trap, Drill, Hip-Hop", min: 140, max: 159 },
  { id: "160-180", label: "160-180 BPM", description: "Drum & Bass, Jungle", min: 160, max: 179 },
  { id: "180+", label: "180+ BPM", description: "Hardstyle, Speedcore", min: 180, max: 999 },
];

export default function BpmPage() {
  const { beats: allBeats, loading } = useBeats({});
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [licenseTarget, setLicenseTarget] = useState<any | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (data.favorites) setLikedIds(new Set(data.favorites.map((f: any) => f.beatId))); })
      .catch(() => { });
  }, [user]);

  const toggleLike = async (id: string) => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLikedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ beatId: id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLikedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
  };

  const bpmRanges = bpmRangesBase.map((range) => {
    const count = allBeats.filter((b) => (b.bpm ?? 0) >= range.min && (b.bpm ?? 0) <= range.max).length;
    return { ...range, count };
  });

  const selectedRangeObj = bpmRanges.find((r) => r.id === selectedRange);
  const currentBeats = selectedRangeObj
    ? allBeats.filter((b) => (b.bpm ?? 0) >= selectedRangeObj.min && (b.bpm ?? 0) <= selectedRangeObj.max)
    : [];

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/catalogue" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6">
            <ChevronLeft className="w-5 h-5" /> Retour au catalogue
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">Explorer par BPM</h1>
            <p className="text-xl text-slate-300">Trouvez le tempo parfait pour votre projet</p>
          </div>

          {/* BPM Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {bpmRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedRange(selectedRange === range.id ? null : range.id)}
                className={`glass rounded-2xl p-6 text-left hover:scale-[1.03] transition-all group ${selectedRange === range.id ? "ring-2 ring-brand-gold bg-brand-gold/5" : ""
                  }`}
              >
                <div className="flex items-center justify-end mb-3">
                  <span className="glass px-3 py-1 rounded-full text-xs">{range.count} beats</span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-brand-gold">{range.label}</h3>
                <p className="text-sm text-slate-400 mt-1">{range.description}</p>
                {/* Visual BPM bar */}
                <div className="mt-4 h-2 bg-white/5 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-yellow-500 rounded-none"
                    style={{ width: `${Math.min(100, (range.count / 300) * 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* BPM Slider visualization */}
          <div className="glass rounded-3xl p-8 mb-12">
            <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-brand-gold" /> Distribution des BPM
            </h3>
            <div className="flex items-end gap-2 h-32">
              {bpmRanges.map((range) => (
                <div key={range.id} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${selectedRange === range.id ? "bg-brand-gold" : "bg-brand-gold/30 hover:bg-brand-gold/50"
                      }`}
                    style={{ height: `${Math.max(20, (range.count / 300) * 100)}%` }}
                  />
                  <span className="text-xs text-slate-400 text-center">{range.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Beats for selected range */}
          {selectedRange && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-6">
                Beats {bpmRanges.find((r) => r.id === selectedRange)?.label}
              </h2>
              {currentBeats.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentBeats.map((beat) => {
                    const isLiked = likedIds.has(beat.id);
                    const dur = beat.duration ? `${Math.floor(beat.duration / 60)}:${String(Math.floor(beat.duration % 60)).padStart(2, "0")}` : null;
                    return (
                      <div key={beat.id} className="glass group rounded-2xl overflow-hidden text-center hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 transition-all duration-200 relative">
                        <div className="relative w-full aspect-square bg-linear-to-br from-brand-purple/30 to-brand-gold/20">
                          {beat.coverImage
                            ? <Image src={resolveFileUrl(beat.coverImage)} alt={beat.title} fill sizes="300px" className="object-cover" />
                            : <Music className="w-14 h-14 text-white/20 absolute inset-0 m-auto" />}
                          <button onClick={() => toggleLike(beat.id)} className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10 ${isLiked ? "text-rose-400 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-400"}`}>
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                          </button>
                          <Link href={`/product/${beat.slug}`} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                            <Play className="w-10 h-10 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg ml-1" />
                          </Link>
                        </div>
                        <div className="p-4">
                          <Link href={`/product/${beat.slug}`} className="font-bold text-base leading-tight mb-0.5 line-clamp-1 hover:text-brand-gold transition-colors block">{beat.title}</Link>
                          <Link href={`/producers/${beat.seller?.id}`} className="text-xs text-slate-400 mb-3 line-clamp-1 hover:text-brand-gold transition-colors block">{beat.seller?.sellerProfile?.artistName || beat.seller?.displayName || beat.seller?.username}</Link>
                          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-3 flex-wrap">
                            {beat.bpm && <span className="text-brand-gold font-bold">{beat.bpm} BPM</span>}
                            {beat.key && <><span className="text-slate-700">·</span><span>{beat.key}</span></>}
                            {dur && <><span className="text-slate-700">·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dur}</span></>}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/10">
                            <span className="text-brand-gold font-bold text-sm">{Number(beat.basicPrice ?? beat.premiumPrice ?? 0).toFixed(2)}€</span>
                            {user?.id !== beat.seller?.id && (
                              <button onClick={() => setLicenseTarget(beat)} className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0">
                                <ShoppingCart className="w-3.5 h-3.5" /> Ajouter
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-slate-400">Aucun beat disponible dans cette plage de BPM pour le moment.</p>
                  <Link href="/catalogue" className="text-brand-gold text-sm mt-2 inline-block hover:underline">
                    Voir tout le catalogue
                  </Link>
                </div>
              )}
            </div>
          )}

          {!selectedRange && (
            <div className="glass rounded-3xl p-12 text-center">
              <h3 className="text-xl font-bold mb-2">Sélectionnez une plage de BPM</h3>
              <p className="text-slate-400">Cliquez sur un tempo ci-dessus pour découvrir les beats disponibles.</p>
            </div>
          )}
        </div>
      </main>



      <LicensePickerModal
        beat={licenseTarget}
        onClose={() => setLicenseTarget(null)}
        onAdd={addToCart}
      />
    </div>
  );
}
