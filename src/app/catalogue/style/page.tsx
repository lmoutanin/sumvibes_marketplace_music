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

const stylesBase = [
  { id: "trap", label: "Trap", color: "from-red-500/20 to-orange-500/10" },
  { id: "rnb", label: "Rnb", color: "from-purple-500/20 to-pink-500/10", displayLabel: "R&B" },
  { id: "pop", label: "Pop", color: "from-yellow-500/20 to-amber-500/10" },
  { id: "hip-hop", label: "Hip-Hop", color: "from-blue-500/20 to-cyan-500/10" },
  { id: "afrobeat", label: "Afrobeat", color: "from-green-500/20 to-emerald-500/10" },
  { id: "drill", label: "Drill", color: "from-slate-500/20 to-zinc-500/10" },
  { id: "reggaeton", label: "Reggaeton", color: "from-lime-500/20 to-green-500/10" },
  { id: "lo-fi", label: "Lo-Fi", color: "from-indigo-500/20 to-violet-500/10" },
  { id: "soul", label: "Soul", color: "from-amber-500/20 to-yellow-500/10" },
  { id: "dancehall", label: "Dancehall", color: "from-teal-500/20 to-cyan-500/10" },
  { id: "electro", label: "Electro", color: "from-fuchsia-500/20 to-pink-500/10", displayLabel: "Électro" },
  { id: "jazz", label: "Jazz", color: "from-orange-500/20 to-amber-500/10" },
  { id: "bouyon", label: "Bouyon", color: "from-teal-500/20 to-cyan-500/10" },
  { id: "shatta", label: "Shatta", color: "from-amber-500/20 to-orange-500/10" },
  { id: "dembow", label: "Dembow", color: "from-lime-500/20 to-yellow-500/10" },
  { id: "k-pop", label: "K-Pop", color: "from-pink-500/20 to-rose-500/10" },
];

export default function StylePage() {
  const { beats: allBeats, loading } = useBeats({});
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
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

  const styles = stylesBase.map((style) => {
    const count = allBeats.filter((b) => b.genre && (Array.isArray(b.genre) ? b.genre.includes(style.label) : b.genre === style.label)).length;
    return { ...style, count };
  });

  const selectedStyleObj = styles.find((s) => s.id === selectedStyle);
  const currentBeats = selectedStyleObj
    ? allBeats.filter((b) => b.genre && (Array.isArray(b.genre) ? b.genre.includes(selectedStyleObj.label) : b.genre === selectedStyleObj.label))
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
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">Explorer par Style</h1>
            <p className="text-xl text-slate-300">Découvrez des beats classés par genre musical</p>
          </div>

          {/* Style Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                className={`glass rounded-2xl overflow-hidden text-center hover:scale-[1.03] transition-all group ${selectedStyle === style.id ? "ring-2 ring-brand-gold bg-brand-gold/5" : ""}`}
              >
                <div className={`w-full aspect-4/3 bg-linear-to-br ${style.color}`} />
                <div className="p-4">
                  <h3 className="font-bold text-lg group-hover:text-brand-gold">{style.displayLabel || style.label}</h3>
                  <p className="text-sm text-slate-400">{style.count} beats</p>
                </div>
              </button>
            ))}
          </div>

          {/* Beats for selected style */}
          {selectedStyle && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-6">
                Beats {styles.find((s) => s.id === selectedStyle)?.displayLabel || styles.find((s) => s.id === selectedStyle)?.label}
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
                  <p className="text-slate-400">Aucun beat disponible pour ce style pour le moment.</p>
                  <Link href="/catalogue" className="text-brand-gold text-sm mt-2 inline-block hover:underline">
                    Voir tout le catalogue
                  </Link>
                </div>
              )}
            </div>
          )}

          {!selectedStyle && (
            <div className="glass rounded-3xl p-12 text-center">
              <h3 className="text-xl font-bold mb-2">Sélectionnez un style</h3>
              <p className="text-slate-400">Cliquez sur un genre musical ci-dessus pour découvrir les beats disponibles.</p>
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
