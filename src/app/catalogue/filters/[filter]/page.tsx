"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";
import { ChevronLeft, Play, ShoppingCart, Heart, Clock, Filter, SlidersHorizontal, Loader2, Music } from "lucide-react";
import { resolveFileUrl } from "@/lib/resolve-file";
import { useCart } from "@/hooks/useCart";

const filterConfigs: Record<string, { title: string; description: string; params: Record<string, string> }> = {
  "nouveautes":    { title: "Nouveautés",            description: "Les dernières productions ajoutées sur SUMVIBES", params: { sortBy: "createdAt", sortOrder: "desc" } },
  "populaires":    { title: "Les plus populaires",   description: "Les beats les plus écoutés et achetés",           params: { sortBy: "plays",     sortOrder: "desc" } },
  "exclusifs":     { title: "Exclusifs",             description: "Beats disponibles en licence exclusive uniquement", params: {} },
  "gratuits":      { title: "Beats gratuits",        description: "Essayez gratuitement avec mention obligatoire",   params: { maxPrice: "0" } },
  "promo":         { title: "Promotions",            description: "Les meilleures offres du moment",                 params: { sortBy: "basicPrice", sortOrder: "asc" } },
  "coups-de-coeur":{ title: "Coups de cœur",         description: "La sélection de l'équipe SUMVIBES",              params: { sortBy: "averageRating", sortOrder: "desc" } },
};

export default function FilterPage({ params }: { params: Promise<{ filter: string }> }) {
  const { filter } = use(params);
  const config = filterConfigs[filter] ?? {
    title: filter.charAt(0).toUpperCase() + filter.slice(1).replace(/-/g, " "),
    description: "Beats filtrés", params: {},
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
                className={`glass px-4 py-2 rounded-none text-sm font-semibold transition-all ${key === filter ? "bg-brand-gold text-brand-purple" : "hover:bg-white/10"}`}>
                {cfg.title}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {beats.map((beat) => {
                const price = beat.basicPrice ?? beat.premiumPrice ?? 0;
                const artistName = beat.seller?.sellerProfile?.artistName || beat.seller?.displayName || "—";
                const dur = beat.duration ? `${Math.floor(beat.duration / 60)}:${String(Math.floor(beat.duration % 60)).padStart(2, "0")}` : null;
                return (
                  <div key={beat.id} className="glass group rounded-2xl overflow-hidden text-center hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 transition-all duration-200 relative">
                    <div className="relative w-full aspect-square bg-linear-to-br from-brand-purple/30 to-brand-gold/20">
                      {beat.coverImage
                        ? <Image src={resolveFileUrl(beat.coverImage)} alt={beat.title} fill sizes="300px" className="object-cover" />
                        : <Music className="w-14 h-14 text-white/20 absolute inset-0 m-auto" />}
                      <Link href={`/product/${beat.slug}`} className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                        <Play className="w-10 h-10 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg ml-1" />
                      </Link>
                    </div>
                    <div className="p-4">
                      <Link href={`/product/${beat.slug}`} className="font-bold text-base leading-tight mb-0.5 line-clamp-1 hover:text-brand-gold transition-colors block">{beat.title}</Link>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-1">{artistName}</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-3 flex-wrap">
                        {beat.bpm && <span>{beat.bpm} BPM</span>}
                        {beat.musicalKey && <><span className="text-slate-700">·</span><span>{beat.musicalKey}</span></>}
                        {dur && <><span className="text-slate-700">·</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dur}</span></>}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-brand-gold font-bold text-sm">{Number(price).toFixed(2)}€</span>
                        <button onClick={() => addToCart(beat.id, "basic")} className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" /> Ajouter
                        </button>
                      </div>
                    </div>
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
