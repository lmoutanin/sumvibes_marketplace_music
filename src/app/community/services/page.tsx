"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Search, Filter, MapPin, Star, Clock, ArrowRight, Plus, MessageSquare, Briefcase, Loader2 } from "lucide-react";

const serviceCategories = [
  { id: "all", label: "Tous", emoji: "🌐" },
  { id: "mixage", label: "Mixage & Mastering", emoji: "🎛️" },
  { id: "ecriture", label: "Écriture / Toplining", emoji: "✍️" },
  { id: "design", label: "Design & Artwork", emoji: "🎨" },
  { id: "video", label: "Vidéo & Clips", emoji: "🎬" },
  { id: "coaching", label: "Coaching", emoji: "🎓" },
  { id: "promo", label: "Promotion", emoji: "📢" },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== "all") queryParams.append("category", activeCategory);
        if (searchQuery) queryParams.append("q", searchQuery);
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", "9");

        const res = await fetch(`/api/services?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.services) {
            setServices(data.services);
            setPagination(data.pagination);
          } else {
            setServices(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, searchQuery, currentPage]);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/community" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8 transition-colors text-sm font-medium">
            <ChevronLeft className="w-5 h-5" /> Retour au Hub
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-gold/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs mb-4 border border-brand-gold/20 text-brand-gold uppercase tracking-widest font-bold">
                <Briefcase className="w-3 h-3" /> Espace Pro
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-2">
                <span className="text-gradient drop-shadow-lg">Services</span> Musicaux
              </h1>
              <p className="text-lg text-slate-300 font-light max-w-xl">
                Trouvez des professionnels de l'industrie pour donner vie à vos projets. Mixage, toplining, design...
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="glass rounded-3xl p-6 lg:p-8 mb-16 relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-gold transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un service, un producteur..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-14 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 focus:bg-white/5 transition-all shadow-inner"
                />
              </div>
              <button className="glass px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 hover:border-brand-gold/30 transition-all font-semibold">
                <Filter className="w-5 h-5" /> Filtres avancés
              </button>
            </div>

            <div className="flex flex-wrap gap-3 relative z-10">
              {serviceCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center gap-2 ${isActive
                      ? "bg-brand-gold text-black shadow-[0_0_15px_rgba(254,204,51,0.4)] scale-105"
                      : "glass bg-black/40 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-300"
                      }`}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured */}
          {activeCategory === "all" && !searchQuery && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold font-display mb-8 flex items-center gap-3">
                <Star className="w-8 h-8 text-brand-gold fill-brand-gold/20" /> Services premium
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.filter((s) => s.featured).map((service) => (
                  <ServiceCard key={service.id} service={service} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Services */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold font-display">
                {searchQuery ? "Résultats de recherche" : activeCategory === "all" ? "Découvrir" : serviceCategories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <span className="text-sm font-medium text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                {pagination.total || services.length} service{(pagination.total || services.length) > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
              </div>
            ) : services.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} featured={service.featured} />
                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl glass bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-300">
                      Page {currentPage} sur {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="w-10 h-10 rounded-xl glass bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass rounded-3xl p-16 text-center border border-white/10 bg-black/20">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <span className="text-5xl">🔍</span>
                </div>
                <h3 className="text-2xl font-bold font-display mb-3">Aucun service trouvé</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-8 font-light">
                  Nous n'avons trouvé aucun service correspondant à vos critères actuels. Essayez de modifier vos filtres.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); setCurrentPage(1); }}
                  className="btn-primary px-8 py-3 rounded-full font-bold shadow-lg"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 mt-12 bg-black/20">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm font-medium">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ service, featured }: { service: any; featured?: boolean }) {
  const { user } = useAuth();
  const authorName = service.seller?.sellerProfile?.artistName || service.seller?.username || "Unknown";
  const catParam = serviceCategories.find(c => c.id === service.category);

  return (
    <div className={`glass rounded-3xl p-6 lg:p-8 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full ${featured
      ? "border border-brand-gold/30 shadow-[0_10px_40px_rgba(254,204,51,0.08)] bg-gradient-to-br from-white/[0.07] to-white/[0.02]"
      : "border border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black/20"
      }`}>
      {featured && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 blur-[50px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl glass bg-black/40 flex items-center justify-center text-3xl shadow-inner border border-white/10 group-hover:scale-110 transition-transform">
            {catParam?.emoji || "✨"}
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-brand-gold uppercase mb-1 bg-brand-gold/10 inline-block px-2 py-0.5 rounded-md border border-brand-gold/20">
              {catParam?.label || service.category}
            </div>
            <p className="text-sm font-medium text-slate-300">
              Par <span className="text-white hover:text-brand-gold transition-colors cursor-pointer">{authorName}</span>
            </p>
          </div>
        </div>

        {featured && (
          <div className="bg-brand-gold text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(254,204,51,0.4)] flex items-center gap-1">
            <Star className="w-3 h-3 fill-black" /> PRO
          </div>
        )}
      </div>

      <h3 className="font-bold text-xl mb-3 text-white leading-snug relative z-10 group-hover:text-brand-gold transition-colors line-clamp-2">
        {service.title}
      </h3>

      <p className="text-sm text-slate-400 mb-6 font-light line-clamp-3 relative z-10 flex-grow">
        {service.description}
      </p>

      <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-300 mb-6 relative z-10">
        <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" /> <span className="text-white">{service.rating?.toString() || "0"}</span> ({service.reviewsCount})</span>
        <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-3.5 h-3.5 text-brand-purple-light" /> {service.location || "En ligne"}</span>
        <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><Clock className="w-3.5 h-3.5 text-green-400" /> {service.deliveryTime || "À définir"}</span>
      </div>

      <div className="pt-5 border-t border-white/10 flex items-center justify-between relative z-10 mt-auto">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Tarif de base</span>
          <div className="text-brand-gold font-bold text-xl drop-shadow-md">€{service.price?.toString()}</div>
        </div>
        <div className="flex gap-2">
          {user?.id !== service.sellerId && (
            <Link href={`/community/messages?new=${service.sellerId}`} className="w-10 h-10 rounded-xl glass bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white hover:text-brand-gold border border-white/10 hover:border-brand-gold/30">
              <MessageSquare className="w-4 h-4" />
            </Link>
          )}
          <Link href={`/community/services/${service.id}`} className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center transition-all shadow-md group-hover:shadow-[0_4px_15px_rgba(254,204,51,0.4)]">
            <ArrowRight className="w-5 h-5 text-black" />
          </Link>
        </div>
      </div>
    </div>
  );
}