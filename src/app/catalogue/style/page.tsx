"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, Play, ShoppingCart, Heart, Clock } from "lucide-react";
import { useBeats } from "@/hooks/useBeats";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { LicensePickerModal } from "@/components/catalogue/LicensePickerModal";

const stylesBase = [
  { id: "trap", label: "Trap", emoji: "🔥", color: "from-red-500/20 to-orange-500/10" },
  { id: "rnb", label: "Rnb", emoji: "💜", color: "from-purple-500/20 to-pink-500/10", displayLabel: "R&B" },
  { id: "pop", label: "Pop", emoji: "🌟", color: "from-yellow-500/20 to-amber-500/10" },
  { id: "hip-hop", label: "Hip-Hop", emoji: "🎤", color: "from-blue-500/20 to-cyan-500/10" },
  { id: "afrobeat", label: "Afrobeat", emoji: "🌍", color: "from-green-500/20 to-emerald-500/10" },
  { id: "drill", label: "Drill", emoji: "⚡", color: "from-slate-500/20 to-zinc-500/10" },
  { id: "reggaeton", label: "Reggaeton", emoji: "🌴", color: "from-lime-500/20 to-green-500/10" },
  { id: "lo-fi", label: "Lo-Fi", emoji: "🌙", color: "from-indigo-500/20 to-violet-500/10" },
  { id: "soul", label: "Soul", emoji: "🎷", color: "from-amber-500/20 to-yellow-500/10" },
  { id: "dancehall", label: "Dancehall", emoji: "🏖️", color: "from-teal-500/20 to-cyan-500/10" },
  { id: "electro", label: "Electro", emoji: "💿", color: "from-fuchsia-500/20 to-pink-500/10", displayLabel: "Électro" },
  { id: "jazz", label: "Jazz", emoji: "🎺", color: "from-orange-500/20 to-amber-500/10" },
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
      .catch(() => {});
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
                className={`glass rounded-2xl p-6 text-center hover:scale-[1.03] transition-all group ${
                  selectedStyle === style.id ? "ring-2 ring-brand-gold bg-brand-gold/5" : ""
                }`}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center mb-3`}>
                  <span className="text-3xl">{style.emoji}</span>
                </div>
                <h3 className="font-bold text-lg group-hover:text-brand-gold">{style.displayLabel || style.label}</h3>
                <p className="text-sm text-slate-400">{style.count} beats</p>
              </button>
            ))}
          </div>

          {/* Beats for selected style */}
          {selectedStyle && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
                <span>{styles.find((s) => s.id === selectedStyle)?.emoji}</span>
                Beats {styles.find((s) => s.id === selectedStyle)?.displayLabel || styles.find((s) => s.id === selectedStyle)?.label}
              </h2>
              {currentBeats.length > 0 ? (
                <div className="space-y-3">
                  {currentBeats.map((beat, i) => (
                    <div key={beat.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5">
                      <Link href={`/product/${beat.slug}`} className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center hover:bg-brand-gold/20 flex-shrink-0">
                        <Play className="w-5 h-5 text-brand-gold ml-0.5" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${beat.slug}`} className="font-bold text-sm hover:text-brand-gold">{beat.title}</Link>
                        <Link href={`/producers/${beat.seller?.id}`} className="text-xs text-slate-400 hover:text-brand-gold transition-colors block">{beat.seller?.sellerProfile?.artistName || beat.seller?.displayName || beat.seller?.username || "—"}</Link>
                      </div>
                      <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
                        <span className="text-brand-gold font-bold">{beat.bpm} BPM</span>
                        {beat.genre?.[0] && <span className="glass px-2 py-0.5 rounded-full">{beat.genre[0]}</span>}
                        {beat.key && <span>{beat.key}</span>}
                        {beat.duration ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(beat.duration / 60)}:{String(beat.duration % 60).padStart(2, "0")}</span> : <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> —</span>}
                      </div>
                      <button onClick={() => toggleLike(beat.id)} className={`glass p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ${likedIds.has(beat.id) ? "text-rose-400" : ""}`}><Heart className={`w-4 h-4 ${likedIds.has(beat.id) ? "fill-current" : ""}`} /></button>
                      <div className="text-brand-gold font-bold text-sm">{Number(beat.basicPrice ?? beat.premiumPrice ?? 0).toFixed(2)}€</div>
                      {user?.id !== beat.seller?.id && (
                        <button onClick={() => setLicenseTarget(beat)} className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" /> Ajouter
                        </button>
                      )}
                    </div>
                  ))}
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
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-2">Sélectionnez un style</h3>
              <p className="text-slate-400">Cliquez sur un genre musical ci-dessus pour découvrir les beats disponibles.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>

      <LicensePickerModal
        beat={licenseTarget}
        onClose={() => setLicenseTarget(null)}
        onAdd={addToCart}
      />
    </div>
  );
}
