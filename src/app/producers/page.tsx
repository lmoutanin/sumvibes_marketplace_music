"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Search, Music, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useProducers } from "@/hooks/useProducers";

export default function ProducersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tous");
  const { producers, loading } = useProducers(searchQuery, selectedGenre);
  const [expandedGenres, setExpandedGenres] = useState<Set<string>>(new Set());

  console.log("ProducersPage render",   producers  );

  const toggleExpandGenres = (e: React.MouseEvent, producerId: string) => {
    e.preventDefault();
    setExpandedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(producerId)) {
        next.delete(producerId);
      } else {
        next.add(producerId);
      }
      return next;
    });
  };

  const genres = [
    "Tous",
    "Trap",
    "Hip-Hop",
    "R&B",
    "Lo-Fi",
    "Pop",
    "Drill",
    "Afrobeat",
  ];

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Nos <span className="text-gradient">Producteurs</span> 🎹
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Découvrez les talents qui font vivre SUMVIBES. Des compositeurs
              passionnés, vérifiés et prêts à collaborer.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un producteur..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === g
                      ? "bg-brand-gold text-slate-900 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      : "glass hover:bg-white/10 text-slate-300 border-white/10"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Producers Grid */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-3xl p-8 animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/5 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-white/5 rounded mb-2"></div>
                        <div className="h-4 bg-white/5 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-12 bg-white/5 rounded mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-white/5 rounded-full"></div>
                      <div className="h-6 w-16 bg-white/5 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : producers.length === 0 ? (
              <div className="text-center py-20">
                <Music className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-bold mb-2">
                  Aucun producteur trouvé
                </h3>
                <p className="text-slate-400">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {producers.map((producer) => (
                  
                  <Link
                    key={producer.id}
                    href={`/producers/${producer.user?.id || producer.id}`}
                    className="glass rounded-3xl p-8 hover:-translate-y-3 hover:shadow-2xl hover:shadow-brand-purple/30 group flex flex-col h-full"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar
                        src={producer.user?.avatar}
                        name={producer.user?.displayName || producer.user?.username}
                        size={64}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl group-hover:text-brand-gold">
                            {producer.user?.displayName ||
                              producer.user?.username}
                          </h3>
                          {/* Vérification si besoin : {producer.isVerified && ...} */}
                        </div>
                        {/* Note : rating/isVerified à adapter si tu veux les afficher depuis SellerProfile */}
                      </div>
                    </div>

                    {/* Bio */}
                    {producer.bio && (
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                        {producer.bio}
                      </p>
                    )}

                    {/* Genres */}
                    {producer.genres && producer.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(expandedGenres.has(producer.id) ? producer.genres : producer.genres.slice(0, 4)).map((genre: string) => (
                          <span
                            key={genre}
                            className="glass px-3 py-1 rounded-full text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                        {producer.genres.length > 4 && !expandedGenres.has(producer.id) && (
                          <button
                            onClick={(e) => toggleExpandGenres(e, producer.id)}
                            className="glass px-3 py-1 rounded-full text-xs text-brand-gold hover:bg-white/10 transition-colors"
                          >
                            +{producer.genres.length - 4}
                          </button>
                        )}
                        {producer.genres.length > 4 && expandedGenres.has(producer.id) && (
                          <button
                            onClick={(e) => toggleExpandGenres(e, producer.id)}
                            className="glass px-3 py-1 rounded-full text-xs text-brand-gold hover:bg-white/10 transition-colors"
                          >
                            Réduire
                          </button>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-6 mt-auto border-t border-white/10">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-brand-gold mb-1">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="font-bold">
                          {producer.totalBeats || 0}
                        </div>
                        <div className="text-xs text-slate-500">Beats</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-brand-gold mb-1">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="font-bold">
                          {producer.totalSales || 0}
                        </div>
                        <div className="text-xs text-slate-500">Ventes</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
