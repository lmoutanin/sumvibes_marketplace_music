"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  Music, Play, Pause, ShoppingCart, Heart, Download, Clock, Disc,
  Tag, Star, ChevronRight, Check, Loader2, AlertCircle
} from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Avatar } from "@/components/ui/Avatar";
import { resolveFileUrl } from "@/lib/resolve-file";


interface License {
  id: string;
  name: string;
  price: number;
  description: string | null;
  allowStreaming: boolean;
  allowSales: number | null;
  allowRadio: boolean;
  allowMusicVideo: boolean;
  includesStems: boolean;
  includesWav: boolean;
  includesMp3: boolean;
}

interface Beat {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  bpm: number;
  key: string | null;
  genre: string[];
  mood: string[];
  tags: string[];
  instruments: string[];
  plays: number;
  sales: number;
  previewUrl: string | null;
  mp3FileUrl: string | null;
  coverImage: string | null;
  basicPrice: number;
  premiumPrice: number | null;
  exclusivePrice: number | null;
  licenses: License[];
  seller: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    sellerProfile: {
      artistName: string;
      verified: boolean;
      averageRating: number;
      totalSales: number;
    } | null;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { id: string; displayName: string | null; username: string; avatar: string | null };
  }>;
  _count: { reviews: number; favorites: number };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const {
    activeBeat,
    isPlaying: isPlayingGlobal,
    isBuffering: isBufferingGlobal,
    playBeat
  } = useAudioPlayer();

  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const isActive = activeBeat?.id === beat?.id;
  const isPlayingAudio = isActive && isPlayingGlobal;
  const isBuffering = isActive && isBufferingGlobal;

  useEffect(() => { fetchBeat(); }, [slug]);

  const fetchBeat = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/beats/${slug}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setBeat(data.beat);
      } else {
        setError(data.error || "Beat introuvable");
      }
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !beat) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.favorites) {
          const isLiked = data.favorites.some((f: any) => f.beatId === beat.id);
          setLiked(isLiked);
        }
      })
      .catch(() => { });
  }, [user, beat?.id]);

  const togglePlay = () => {
    if (!beat) return;
    playBeat({
      id: beat.id,
      title: beat.title,
      slug: beat.slug,
      coverImage: beat.coverImage,
      mp3FileUrl: beat.mp3FileUrl,
      previewUrl: beat.previewUrl,
      basicPrice: beat.basicPrice,
      premiumPrice: beat.premiumPrice ?? undefined,
      exclusivePrice: beat.exclusivePrice ?? undefined,
      seller: {
        id: beat.seller.id,
        username: beat.seller.username,
        displayName: beat.seller.displayName
      }
    });
  };

  const handleToggleFavorite = async () => {
    if (!user || !beat) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      const res = await fetch(`/api/favorites`, {
        method: newLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ beatId: beat.id }),
      });
      if (!res.ok) setLiked(!newLiked);
    } catch {
      setLiked(!newLiked);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        </main>
      </div>
    );
  }

  if (error || !beat) {
    const isExclusiveError = error?.toLowerCase().includes("exclusivité");
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">
              {isExclusiveError ? "Contenu réservé" : "Beat introuvable"}
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              {error || "Ce beat n'existe plus ou a été supprimé."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/catalogue" className="btn-primary px-8 py-3 rounded-full font-bold">Retour au catalogue</Link>
              <Link href="/" className="glass px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors">Accueil</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const producerName = beat.seller.sellerProfile?.artistName || beat.seller.displayName || beat.seller.username;
  const avgRating = beat._count.reviews > 0
    ? beat.reviews.reduce((s, r) => s + r.rating, 0) / beat.reviews.length
    : 0;

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/catalogue" className="hover:text-brand-gold">Catalogue</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{beat.title}</span>
          </nav>
        </div>

        <section className="mx-auto max-w-7xl px-6 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Col */}
            <div>
              <div className="max-w-[420px] mx-auto lg:mx-0">
                <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-square bg-gradient-to-br from-brand-purple/30 to-brand-pink/30 flex items-center justify-center overflow-hidden group">
                    {beat.coverImage ? (
                      <img
                        src={resolveFileUrl(beat.coverImage) || '/logo.jpg'}
                        alt={beat.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Music className="w-32 h-32 text-white/10" />
                    )}

                    <div className={`absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors ${isPlayingAudio ? 'bg-black/40' : ''}`}>
                      {/* Like button on top-right of cover */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
                        className={`absolute top-4 right-4 p-3 rounded-full glass border transition-all hover:scale-110 z-10 ${liked ? "text-rose-500 border-rose-500/50 bg-rose-500/10" : "text-white border-white/10 hover:border-white/30 bg-white/5"}`}
                        title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                      </button>

                      <button
                        onClick={togglePlay}
                        className="rounded-full bg-brand-gold p-6 shadow-2xl hover:scale-110 transition-transform glow-gold text-black uppercase"
                      >
                        {isBuffering ? (
                          <Loader2 className="w-12 h-12 animate-spin" />
                        ) : isPlayingAudio ? (
                          <Pause className="w-12 h-12 fill-current" />
                        ) : (
                          <Play className="w-12 h-12 fill-current ml-1" />
                        )}
                      </button>
                    </div>

                    {beat.genre[0] && (
                      <div className="absolute top-4 left-4">
                        <span className="glass px-3 py-1 rounded-full text-xs font-bold">{beat.genre[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Play className="w-4 h-4" /> {beat.plays.toLocaleString()} écoutes</span>
                      <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {beat.sales} ventes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Producer card */}
              <div className="glass rounded-2xl p-6 mt-6">
                <Link href={`/producers/${beat.seller.id}`} className="flex items-center gap-4 group">
                  <Avatar src={beat.seller.avatar} name={producerName} size={56} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg group-hover:text-brand-gold">{producerName}</span>
                      {beat.seller.sellerProfile?.verified && (
                        <span className="bg-brand-gold/20 text-brand-gold text-xs px-2 py-0.5 rounded-full font-bold">✓ Vérifié</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">Voir le profil</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-gold" />
                </Link>
              </div>
            </div>

            {/* Right Col */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">{beat.title}</h1>

              {beat._count.reviews > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(avgRating) ? "fill-brand-gold text-brand-gold" : "text-slate-600"}`} />
                    ))}
                  </div>
                  <span className="text-brand-gold font-bold">{avgRating.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">({beat._count.reviews} avis)</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-gold" />
                  <div><div className="text-xs text-slate-400">BPM</div><div className="font-bold">{beat.bpm}</div></div>
                </div>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <Music className="w-5 h-5 text-brand-gold" />
                  <div><div className="text-xs text-slate-400">Tonalité</div><div className="font-bold">{beat.key || "—"}</div></div>
                </div>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <Disc className="w-5 h-5 text-brand-gold" />
                  <div><div className="text-xs text-slate-400">Genre</div><div className="font-bold">{beat.genre.join(", ")}</div></div>
                </div>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <Tag className="w-5 h-5 text-brand-gold" />
                  <div><div className="text-xs text-slate-400">Ambiance</div><div className="font-bold">{beat.mood.join(", ") || "—"}</div></div>
                </div>
              </div>

              {beat.description && (
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-3">Description</h3>
                  <p className="text-slate-300 leading-relaxed">{beat.description}</p>
                </div>
              )}

              {beat.instruments.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-3">Instruments</h3>
                  <div className="flex flex-wrap gap-2">
                    {beat.instruments.map((inst) => (
                      <span key={inst} className="glass px-3 py-1.5 rounded-full text-sm">{inst}</span>
                    ))}
                  </div>
                </div>
              )}


            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
