"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Music, Play, Pause, ShoppingCart, Heart, Share2, Download, Clock, Disc,
  Tag, Star, ChevronRight, Check, User, Loader2, AlertCircle
} from "lucide-react";

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
  const audioRef = useRef<HTMLAudioElement>(null);

  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(0);
  const [liked, setLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    fetchBeat();
  }, [slug]);

  const fetchBeat = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/beats/${slug}`);
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

  const togglePlay = () => {
    if (!audioRef.current || !beat?.previewUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAddToCart = async () => {
    if (!user) { window.location.href = '/login'; return; }
    if (!beat) return;
    const license = beat.licenses[selectedLicense];
    if (!license) return;

    setAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ beatId: beat.id, licenseId: license.id }),
      });
      if (res.ok) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !beat) return;
    const token = localStorage.getItem('token');
    const method = liked ? 'DELETE' : 'POST';
    await fetch(`/api/favorites`, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ beatId: beat.id }),
    });
    setLiked(!liked);
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
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Beat introuvable</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link href="/catalogue" className="btn-primary px-6 py-3 rounded-full">Retour au catalogue</Link>
          </div>
        </main>
      </div>
    );
  }

  const selectedLic = beat.licenses[selectedLicense];
  const producerName = beat.seller.sellerProfile?.artistName || beat.seller.displayName || beat.seller.username;
  const avgRating = beat._count.reviews > 0
    ? beat.reviews.reduce((s, r) => s + r.rating, 0) / beat.reviews.length
    : 0;

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      {beat.previewUrl && (
        <audio ref={audioRef} src={beat.previewUrl} onEnded={() => setIsPlaying(false)} />
      )}

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/catalogue" className="hover:text-brand-gold">Catalogue</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{beat.title}</span>
          </nav>
        </div>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="glass rounded-3xl overflow-hidden">
                <div className="relative aspect-square bg-gradient-to-br from-brand-purple/30 to-brand-pink/30 flex items-center justify-center overflow-hidden">
                  {beat.coverImage ? (
                    <img src={beat.coverImage} alt={beat.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-32 h-32 text-white/10" />
                  )}
                  <button
                    onClick={togglePlay}
                    disabled={!beat.previewUrl}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 disabled:cursor-not-allowed"
                  >
                    <div className="rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark p-6 shadow-2xl hover:scale-110 glow-gold">
                      {isPlaying ? (
                        <Pause className="w-12 h-12 text-black fill-current" />
                      ) : (
                        <Play className="w-12 h-12 text-black fill-current" />
                      )}
                    </div>
                  </button>
                  {beat.genre[0] && (
                    <div className="absolute top-4 left-4">
                      <span className="glass px-3 py-1 rounded-full text-xs font-bold">{beat.genre[0]}</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={handleToggleFavorite} className={`glass p-3 rounded-xl hover:bg-white/10 ${liked ? "text-red-500" : ""}`}>
                        <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                      </button>
                      <button className="glass p-3 rounded-xl hover:bg-white/10">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Play className="w-4 h-4" /> {beat.plays.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Download className="w-4 h-4" /> {beat.sales}</span>
                    </div>
                  </div>
                  {!beat.previewUrl && (
                    <p className="text-center text-xs text-slate-500 mt-2">Aperçu non disponible</p>
                  )}
                </div>
              </div>

              <div className="glass rounded-2xl p-6 mt-6">
                <Link href={`/producers/${beat.seller.id}`} className="flex items-center gap-4 group">
                  {beat.seller.avatar ? (
                    <img src={beat.seller.avatar} alt={producerName} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-gold/30 flex items-center justify-center">
                      <User className="w-7 h-7 text-brand-gold" />
                    </div>
                  )}
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

              {beat.licenses.length > 0 ? (
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Choisir une licence</h3>
                  <div className="space-y-4">
                    {beat.licenses.map((license, i) => (
                      <button
                        key={license.id}
                        onClick={() => setSelectedLicense(i)}
                        className={`w-full text-left glass rounded-2xl p-6 border-2 ${
                          selectedLicense === i ? "border-brand-gold bg-brand-gold/5" : "border-transparent hover:border-white/20"
                        } relative`}
                      >
                        {i === 1 && beat.licenses.length > 2 && (
                          <span className="absolute -top-3 right-4 bg-brand-gold text-black text-xs px-3 py-1 rounded-full font-bold">POPULAIRE</span>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-lg">{license.name}</span>
                          <span className="text-2xl font-bold text-gradient">{Number(license.price).toFixed(2)} €</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                          {license.includesMp3 && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-gold flex-shrink-0" />MP3 haute qualité</div>}
                          {license.includesWav && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-gold flex-shrink-0" />Fichier WAV</div>}
                          {license.includesStems && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-gold flex-shrink-0" />Stems inclus</div>}
                          {license.allowStreaming && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-gold flex-shrink-0" />Streaming autorisé</div>}
                          {license.allowRadio && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-gold flex-shrink-0" />Radio autorisée</div>}
                          {license.allowSales !== null && (
                            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-gold flex-shrink-0" />
                              {license.allowSales === 0 ? "Ventes illimitées" : `${license.allowSales.toLocaleString()} copies`}
                            </div>
                          )}
                          {license.description && <div className="col-span-2 text-slate-400 text-xs mt-1">{license.description}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8 glass rounded-2xl p-6 text-center">
                  <p className="text-slate-400">Prix de base : <span className="text-2xl font-bold text-gradient">{Number(beat.basicPrice).toFixed(2)} €</span></p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || beat.licenses.length === 0}
                  className="flex-1 btn-primary rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-dark py-4 font-bold text-black text-lg hover:shadow-brand-gold/50 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : cartSuccess ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {cartSuccess ? "Ajouté !" : `Ajouter au panier — ${selectedLic ? Number(selectedLic.price).toFixed(2) : Number(beat.basicPrice).toFixed(2)} €`}
                </button>
              </div>

              {beat.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-bold text-lg mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {beat.tags.map((tag) => (
                      <Link key={tag} href={`/catalogue?search=${tag}`} className="glass px-3 py-1.5 rounded-full text-sm text-slate-400 hover:text-brand-gold">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {beat.reviews.length > 0 && (
                <div className="mt-8 glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Avis ({beat._count.reviews})</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-brand-gold text-brand-gold" />
                      <span className="font-bold text-brand-gold">{avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {beat.reviews.map((review) => (
                      <div key={review.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-gold/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {review.user.avatar ? (
                            <img src={review.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-brand-gold" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{review.user.displayName || review.user.username}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-brand-gold text-brand-gold" : "text-slate-600"}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-sm text-slate-400">{review.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
