"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, Play, ShoppingCart, Heart, Clock, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const filterConfigs: Record<string, { title: string; description: string; emoji: string; params: Record<string, string> }> = {
  "nouveautes":    { title: "Nouveautés",            description: "Les dernières productions ajoutées sur SUMVIBES", emoji: "✨", params: { sortBy: "createdAt", sortOrder: "desc" } },
  "populaires":    { title: "Les plus populaires",   description: "Les beats les plus écoutés et achetés",           emoji: "🔥", params: { sortBy: "plays",     sortOrder: "desc" } },
  "exclusifs":     { title: "Exclusifs",             description: "Beats disponibles en licence exclusive uniquement",emoji: "💎", params: {} },
  "gratuits":      { title: "Beats gratuits",        description: "Essayez gratuitement avec mention obligatoire",   emoji: "🎁", params: { maxPrice: "0" } },
  "promo":         { title: "Promotions",            description: "Les meilleures offres du moment",                 emoji: "🏷️", params: { sortBy: "basicPrice", sortOrder: "asc" } },
  "coups-de-coeur":{ title: "Coups de cœur",         description: "La sélection de l'équipe SUMVIBES",              emoji: "❤️", params: { sortBy: "averageRating", sortOrder: "desc" } },
};

export default function FilterPage({ params }: { params: Promise<{ filter: string }> }) {
  const { filter } = use(params);
  const config = filterConfigs[filter] ?? {
    title: filter.charAt(0).toUpperCase() + filter.slice(1).replace(/-/g, " "),
    description: "Beats filtrés", emoji: "🎵", params: {},
  };

  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadBeats() {
      setLoading(true);
      try {
        const p = new URLSearchParams({ ...config.params, limit: "20", status: "PUBLISHED" });
        if (sortBy === "popular")   { p.set("sortBy", "plays");      p.set("sortOrder", "desc"); }
        if (sortBy === "price-asc") { p.set("sortBy", "basicPrice"); p.set("sortOrder", "asc");  }
        if (sortBy === "price-desc"){ p.set("sortBy", "basicPrice"); p.set("sortOrder", "desc"); }
        const res = await fetch(`/api/beats?${p}`);
        if (res.ok) {
          const data = await res.json();
          setBeats(data.beats || []);
        }
      } finally { setLoading(false); }
    }
    loadBeats();
  }, [filter, sortBy]);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/catalogue" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6">
            <ChevronLeft className="w-5 h-5" /> Retour au catalogue
          </Link>

          <div className="glass rounded-3xl p-8 md:p-12 mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{config.emoji}</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">{config.title}</h1>
                <p className="text-lg text-slate-300 mt-2">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 text-sm text-slate-400">
              <Filter className="w-4 h-4" />
              <span>{loading ? "Chargement…" : `${beats.length} résultat${beats.length !== 1 ? "s" : ""}`}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {Object.entries(filterConfigs).map(([key, cfg]) => (
              <Link key={key} href={`/catalogue/filters/${key}`}
                className={`glass px-4 py-2 rounded-full text-sm font-semibold transition-all ${key === filter ? "bg-brand-gold text-brand-purple" : "hover:bg-white/10"}`}>
                {cfg.emoji} {cfg.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Trier par :</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-gold/50">
                <option value="recent">Plus récents</option>
                <option value="popular">Populaires</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto" /></div>
          ) : beats.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <p className="text-slate-400 text-lg">Aucun beat trouvé pour ce filtre.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {beats.map((beat) => {
                const price = beat.basicPrice ?? beat.premiumPrice ?? 0;
                const artistName = beat.seller?.sellerProfile?.artistName || beat.seller?.displayName || "—";
                const duration = beat.duration ? `${Math.floor(beat.duration / 60)}:${String(beat.duration % 60).padStart(2, "0")}` : "—";
                return (
                  <div key={beat.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <Link href={`/product/${beat.slug}`} className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center hover:bg-brand-gold/20 flex-shrink-0">
                      <Play className="w-5 h-5 text-brand-gold ml-0.5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${beat.slug}`} className="font-bold text-sm hover:text-brand-gold">{beat.title}</Link>
                      <p className="text-xs text-slate-400">{artistName}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
                      {beat.genre?.[0] && <span className="glass px-2 py-0.5 rounded-full">{beat.genre[0]}</span>}
                      {beat.mood?.[0] && <span className="glass px-2 py-0.5 rounded-full">{beat.mood[0]}</span>}
                      {beat.bpm && <span>{beat.bpm} BPM</span>}
                      {beat.musicalKey && <span>{beat.musicalKey}</span>}
                      {duration !== "—" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {duration}</span>}
                    </div>
                    <button className="glass p-2 rounded-lg hover:bg-white/10"><Heart className="w-4 h-4" /></button>
                    <div className="text-brand-gold font-bold text-sm">{Number(price).toFixed(2)}€</div>
                    <button onClick={() => addToCart(beat.id, "basic")}
                      className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">© 2026 SUMVIBES by SAS BE GREAT.</div>
      </footer>
    </div>
  );
}
