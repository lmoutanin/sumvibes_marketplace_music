"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";
import { ChevronLeft, Play, ShoppingCart, Heart, Clock, Music } from "lucide-react";
import { resolveFileUrl } from "@/lib/resolve-file";
import { useBeats } from "@/hooks/useBeats";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { LicensePickerModal } from "@/components/catalogue/LicensePickerModal";

const moodsBase = [
  { id: "dark", label: "Dark", color: "from-slate-800/40 to-slate-900/20" },
  { id: "chill", label: "Chill", color: "from-cyan-500/20 to-blue-500/10" },
  { id: "uplifting", label: "Uplifting", color: "from-yellow-500/20 to-orange-500/10" },
  { id: "energetic", label: "Energetic", color: "from-red-500/20 to-rose-500/10" },
  { id: "romantic", label: "Romantic", color: "from-pink-500/20 to-rose-400/10" },
  { id: "aggressive", label: "Aggressive", color: "from-red-600/20 to-orange-600/10" },
  { id: "melancholic", label: "Melancholic", color: "from-indigo-500/20 to-blue-600/10" },
];

export default function AmbiancePage() {
  const { beats: allBeats, loading } = useBeats({});
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
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

  const moods = moodsBase.map((mood) => {
    const count = allBeats.filter((b) => b.mood && (Array.isArray(b.mood) ? b.mood.includes(mood.label) : b.mood === mood.label)).length;
    return { ...mood, count };
  });

  const selectedMoodObj = moods.find((m) => m.id === selectedMood);
  const currentBeats = selectedMoodObj
    ? allBeats.filter((b) => b.mood && (Array.isArray(b.mood) ? b.mood.includes(selectedMoodObj.label) : b.mood === selectedMoodObj.label))
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
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">Explorer par Ambiance</h1>
            <p className="text-xl text-slate-300">Découvrez des beats classés par humeur (mood)</p>
          </div>

          {/* Mood Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                className={`glass rounded-2xl overflow-hidden text-center hover:scale-[1.03] transition-all group ${selectedMood === mood.id ? "ring-2 ring-brand-gold bg-brand-gold/5" : ""}`}
              >
                <div className={`w-full aspect-4/3 bg-linear-to-br ${mood.color}`} />
                <div className="p-4">
                  <h3 className="font-bold text-lg group-hover:text-brand-gold">{mood.label}</h3>
                  <p className="text-sm text-slate-400">{mood.count} beats</p>
                </div>
              </button>
            ))}
          </div>

          {/* Beats for selected mood */}
          {selectedMood && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-6">
                Beats {moods.find((m) => m.id === selectedMood)?.label}
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
                            {beat.bpm && <span>{beat.bpm} BPM</span>}
                            {beat.mood?.[0] && <><span className="text-slate-700">·</span><span>{beat.mood[0]}</span></>}
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
                  <p className="text-slate-400">Aucun beat disponible pour cette ambiance pour le moment.</p>
                  <Link href="/catalogue" className="text-brand-gold text-sm mt-2 inline-block hover:underline">
                    Voir tout le catalogue
                  </Link>
                </div>
              )}
            </div>
          )}

          {!selectedMood && (
            <div className="glass rounded-3xl p-12 text-center">
              <h3 className="text-xl font-bold mb-2">Sélectionnez une ambiance</h3>
              <p className="text-slate-400">Cliquez sur une humeur musicale ci-dessus pour découvrir les beats disponibles.</p>
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
