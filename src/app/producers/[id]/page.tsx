"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useCart } from "@/hooks/useCart";
import { LicensePickerModal } from "@/components/catalogue/LicensePickerModal";
import {
  Music, Play, Pause, Star, Award, CheckCircle,
  Heart, ShoppingCart, Globe, MessageCircle, ChevronLeft,
  User, Loader2, AlertCircle, Search, Instagram, Twitter,
  Youtube, Clock, BarChart2, Briefcase, MessageSquare, ArrowRight, Upload,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { resolveFileUrl } from "@/lib/resolve-file";

interface Beat {
  id: string;
  title: string;
  slug: string;
  bpm: number | null;
  key: string | null;
  genre: string[];
  mood: string[];
  basicPrice: number | null;
  premiumPrice: number | null;
  exclusivePrice: number | null;
  plays: number;
  coverImage: string | null;
  previewUrl: string;
  duration: number | null;
  _count?: { favorites: number };
}

interface Producer {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  createdAt: string;
  sellerProfile: {
    artistName: string;
    description: string | null;
    genres: string[];
    verified: boolean;
    totalSales: number;
    totalBeats: number;
    totalRevenue: number;
    averageRating: number | null;
    totalReviews: number;
  } | null;
}

interface ProducerService {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
}



function formatDuration(secs?: number | null) {
  if (!secs) return "—";
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
}

export default function ProducerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [producer, setProducer] = useState<Producer | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // Audio player
  const { playBeat, activeBeat, isPlaying: isPlayingAudio } = useAudioPlayer();

  // Favorites
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Cart modal
  const [licenseTarget, setLicenseTarget] = useState<Beat | null>(null);

  // Services
  const [services, setServices] = useState<ProducerService[]>([]);

  // Pagination
  const BEATS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Load producer + beats + services
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [producerRes, beatsRes, servicesRes] = await Promise.all([
          fetch(`/api/producers/${id}`),
          fetch(`/api/beats?sellerId=${id}&limit=100&status=PUBLISHED`),

          fetch(`/api/services?sellerId=${id}&limit=10`),
        ]);
        if (producerRes.ok) {
          const d = await producerRes.json();
          setProducer(d.producer);
        } else {
          setError("Producteur introuvable");
        }
        if (beatsRes.ok) {
          const d = await beatsRes.json();
          setBeats(d.beats || []);
        }
        if (servicesRes.ok) {
          const d = await servicesRes.json();
          setServices(d.services || []);
        }
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Load favorites
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.favorites) setLikedIds(new Set(d.favorites.map((f: any) => f.beatId)));
      })
      .catch(() => { });
  }, [user]);

  const toggleLike = async (beatId: string) => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLikedIds((prev) => { const n = new Set(prev); n.has(beatId) ? n.delete(beatId) : n.add(beatId); return n; });
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ beatId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLikedIds((prev) => { const n = new Set(prev); n.has(beatId) ? n.delete(beatId) : n.add(beatId); return n; });
    }
  };

  const togglePlay = (beat: Beat) => {
    const audioBeat = {
      ...beat,
      basicPrice: beat.basicPrice ?? undefined,
      premiumPrice: beat.premiumPrice ?? undefined,
      exclusivePrice: beat.exclusivePrice ?? undefined,
      seller: producer ? {
        id: producer.id,
        username: producer.username,
        displayName: producer.displayName || producer.username
      } : undefined
    };
    playBeat(audioBeat);
  };

  const filteredBeats = beats.filter((b) =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.genre.some((g) => g.toLowerCase().includes(search.toLowerCase())) ||
    (b.key && b.key.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredBeats.length / BEATS_PER_PAGE);
  const pagedBeats = filteredBeats.slice((currentPage - 1) * BEATS_PER_PAGE, currentPage * BEATS_PER_PAGE);

  // Reset page 1 quand la recherche change
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPlays = beats.reduce((s, b) => s + b.plays, 0);

  if (loading)
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        </main>
      </div>
    );

  if (error || !producer)
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Producteur introuvable</h2>
            <Link href="/producers" className="btn-primary px-6 py-3 rounded-none mt-4 inline-block">
              Retour
            </Link>
          </div>
        </main>
      </div>
    );

  const profile = producer.sellerProfile;
  const displayName = profile?.artistName || producer.displayName || producer.username;
  const genreList = profile?.genres?.length
    ? profile.genres
    : beats.flatMap((b) => b.genre).filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        {/* Back */}
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link href="/producers" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold transition-colors">
            <ChevronLeft className="w-5 h-5" /> Tous les producteurs
          </Link>
        </div>

        {/* Hero Banner */}
        <section className="px-6 pb-0">
          <div className="mx-auto max-w-7xl">
            <div className="glass rounded-3xl overflow-hidden">
              {/* Cover */}
              <div className="h-52 md:h-72 bg-gradient-to-br from-brand-purple/50 via-slate-900 to-brand-gold/20 relative flex items-end">
                <div className="absolute inset-0 overflow-hidden">
                  {genreList.slice(0, 3).map((g, i) => (
                    <div key={g} className={`absolute text-[120px] font-black opacity-[0.03] select-none pointer-events-none`}
                      style={{ top: `${i * 30}%`, left: `${i * 25}%` }}>
                      {g}
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Header */}
              <div className="px-6 md:px-10 pb-8 -mt-14 relative">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-brand-dark border-4 border-[#0c0c14] overflow-hidden flex-shrink-0 shadow-xl">
                    <Avatar
                      src={producer.avatar}
                      name={displayName}
                      size={112}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 pt-4 md:pt-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold font-display">{displayName}</h1>
                      {profile?.verified && (
                        <span className="bg-brand-gold/20 text-brand-gold text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Vérifié
                        </span>
                      )}
                    </div>
                    {producer.username !== displayName && (
                      <p className="text-slate-500 text-sm mb-2">@{producer.username}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      {(profile?.averageRating ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                          {Number(profile!.averageRating).toFixed(1)}
                          <span className="text-slate-600">({profile!.totalReviews} avis)</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Music className="w-4 h-4 text-brand-gold" />
                        {profile?.totalBeats || 0} beat{profile?.totalBeats !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Membre depuis {new Date(producer.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {genreList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {genreList.map((g) => (
                          <span key={g} className="glass px-2.5 py-0.5 rounded-full text-xs text-slate-300">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-shrink-0">
                    {user?.id === id ? (
                      <Link href="/seller/beats"
                        className="btn-primary rounded-xl px-5 py-3 font-semibold flex items-center gap-2 text-sm shadow-lg shadow-brand-gold/20">
                        <Upload className="w-5 h-5" /> Uploader un beat
                      </Link>
                    ) : (
                      <Link href={`/community/messages?new=${id}`}
                        className="glass rounded-xl px-5 py-3 font-semibold hover:bg-white/10 flex items-center gap-2 text-sm transition-all">
                        <MessageCircle className="w-5 h-5" /> Message
                      </Link>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {(profile?.description || producer.bio) && (
                  <div className="mt-6 pt-6 border-t border-white/[0.07]">
                    <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                      {profile?.description || producer.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-6 py-10 pb-24">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-4 gap-8">

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Stats */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4">Statistiques</h3>
                <div className="space-y-3">
                  {[
                    { icon: Music, val: profile?.totalBeats || 0, label: "Beats publiés", color: "text-brand-gold" },
                    { icon: BarChart2, val: totalPlays > 999 ? `${(totalPlays / 1000).toFixed(1)}K` : totalPlays, label: "Écoutes", color: "text-blue-400" },
                  ].map(({ icon: Icon, val, label, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Icon className={`w-4 h-4 ${color}`} />
                        {label}
                      </div>
                      <span className="font-bold text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              {(producer.website || producer.instagram || producer.twitter || producer.youtube) && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4">Liens</h3>
                  <div className="space-y-2">
                    {producer.website && (
                      <a href={producer.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-300 hover:text-brand-gold transition-colors py-1">
                        <Globe className="w-4 h-4 flex-shrink-0" /> Site web
                      </a>
                    )}
                    {producer.instagram && (
                      <a href={`https://instagram.com/${producer.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-300 hover:text-pink-400 transition-colors py-1">
                        <Instagram className="w-4 h-4 flex-shrink-0" /> {producer.instagram}
                      </a>
                    )}
                    {producer.twitter && (
                      <a href={`https://twitter.com/${producer.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-300 hover:text-sky-400 transition-colors py-1">
                        <Twitter className="w-4 h-4 flex-shrink-0" /> {producer.twitter}
                      </a>
                    )}
                    {producer.youtube && (
                      <a href={producer.youtube.startsWith("http") ? producer.youtube : `https://youtube.com/@${producer.youtube.replace("@", "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-300 hover:text-red-400 transition-colors py-1">
                        <Youtube className="w-4 h-4 flex-shrink-0" /> YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Genres */}
              {genreList.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {genreList.map((g) => (
                      <button key={g} onClick={() => setSearch(search === g ? "" : g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${search === g ? "bg-brand-gold text-slate-900 font-bold" : "glass hover:bg-white/10"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Beats list */}
            <div className="lg:col-span-3">
              {/* Header + search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                  Beats disponibles
                  <span className="text-4xl font-black font-display text-white">
                    {search ? filteredBeats.length : beats.length}
                  </span>
                </h2>
                <div className="relative sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher un beat, genre, tonalité..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
              </div>

              {beats.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun beat publié pour le moment.</p>
                </div>
              ) : filteredBeats.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Aucun résultat pour « {search} »</p>
                  <button onClick={() => setSearch("")} className="text-brand-gold text-sm hover:underline mt-2">
                    Effacer la recherche
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pagedBeats.map((beat) => {
                    const isActive = activeBeat?.id === beat.id;
                    const isLiked = likedIds.has(beat.id);
                    const isSeller = user?.id === id;
                    const isPlaying = isActive && isPlayingAudio;

                    return (
                      <div key={beat.id}
                        className={`glass rounded-2xl p-4 md:p-5 flex items-center gap-4 md:gap-5 hover:bg-white/[0.07] transition-all group ${isActive ? "ring-1 ring-brand-gold/40 bg-brand-gold/[0.06]" : ""}`}>

                        {/* Cover + Play */}
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/10">
                          {beat.coverImage ? (
                            <img src={resolveFileUrl(beat.coverImage)} alt={beat.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-6 h-6 text-white/20" />
                            </div>
                          )}
                          <button
                            onClick={() => togglePlay(beat)}
                            className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-all rounded-xl z-20 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            {isPlaying
                              ? <Pause className="w-6 h-6 text-brand-gold fill-current" />
                              : <Play className="w-6 h-6 text-brand-gold fill-current ml-0.5" />}
                          </button>
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${beat.slug}`}
                            className="font-bold text-base hover:text-brand-gold transition-colors truncate block mb-1.5">
                            {beat.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2">
                            {beat.bpm && <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full font-semibold">{beat.bpm} BPM</span>}
                            {beat.key && <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{beat.key}</span>}
                            {beat.genre[0] && <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{beat.genre[0]}</span>}
                            {beat.duration && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(beat.duration)}</span>}
                          </div>
                        </div>

                        {/* Plays */}
                        <div className="hidden lg:flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[48px]">
                          <Play className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-400 font-medium">{beat.plays.toLocaleString("fr-FR")}</span>
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 min-w-[72px] text-right">
                          <span className="text-brand-gold font-bold text-base">{beat.basicPrice ? `${Number(beat.basicPrice).toFixed(2)} €` : "—"}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleLike(beat.id)}
                            className={`p-2.5 rounded-xl border transition-colors ${isLiked
                              ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                              : "bg-white/5 border-white/10 text-slate-400 hover:border-rose-500/30 hover:text-rose-400"
                              }`}
                            title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                          </button>
                          {!isSeller && (
                            <button
                              onClick={() => setLicenseTarget(beat)}
                              className="bg-brand-gold hover:bg-brand-gold/90 text-slate-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Ajouter au panier"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span className="hidden sm:inline">Ajouter</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl glass text-sm font-medium disabled:opacity-30 hover:bg-white/10 transition-colors disabled:cursor-not-allowed"
                  >
                    ← Précédent
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const isCurrent = p === currentPage;
                      const isNear = Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages;
                      if (!isNear) {
                        if (p === currentPage - 3 || p === currentPage + 3) {
                          return <span key={p} className="text-slate-600 px-1">…</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${isCurrent
                            ? "bg-brand-gold text-slate-900"
                            : "glass hover:bg-white/10 text-slate-300"
                            }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl glass text-sm font-medium disabled:opacity-30 hover:bg-white/10 transition-colors disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Services proposés */}
        {services.length > 0 && (
          <section className="px-6 pb-16">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-brand-gold" /> Services proposés
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => {
                  return (
                    <div key={s.id} className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(254,215,102,0.08)] transition-all group relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-2xl rounded-full group-hover:bg-brand-gold/10 transition-colors pointer-events-none" />
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl glass bg-black/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Briefcase className="w-5 h-5 text-brand-gold/60" /></div>
                        <span className="bg-brand-gold/10 border border-brand-gold/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-gold">{s.category}</span>
                      </div>
                      <Link href={`/community/services/${s.id}`}>
                        <h3 className="font-bold text-lg mb-2 text-white leading-snug relative z-10 hover:text-brand-gold transition-colors">{s.title}</h3>
                      </Link>
                      {s.description && (
                        <p className="text-sm text-slate-400 mb-4 font-light line-clamp-2 relative z-10 flex-grow">{s.description}</p>
                      )}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10 mt-auto">
                        <div className="text-brand-gold font-bold text-lg">À partir de {s.price}€</div>
                        <div className="flex gap-2">
                          {user?.id !== id && (
                            <Link href={`/community/messages?new=${id}`}
                              className="w-9 h-9 rounded-xl glass bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/30 flex items-center justify-center transition-colors text-white hover:text-brand-gold"
                              title="Contacter le prestataire">
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* License Picker Modal */}
      <LicensePickerModal
        beat={licenseTarget}
        onClose={() => setLicenseTarget(null)}
        onAdd={addToCart}
      />
    </div>
  );
}

