"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Music,
  Play,
  Star,
  TrendingUp,
  Award,
  CheckCircle,
  Heart,
  ShoppingCart,
  Globe,
  MessageCircle,
  ChevronLeft,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ProducerBeat {
  id: string;
  title: string;
  slug: string;
  bpm: number;
  genre: string[];
  mood: string[];
  basicPrice: number;
  plays: number;
  coverImage: string | null;
}

interface Producer {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  sellerProfile: {
    artistName: string;
    bio: string | null;
    website: string | null;
    instagram: string | null;
    verified: boolean;
    averageRating: number;
    totalSales: number;
    genres: string[];
  } | null;
}

export default function ProducerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [beats, setBeats] = useState<ProducerBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userRes, beatsRes] = await Promise.all([
          fetch(`/api/admin/users/${id}`),
          fetch(`/api/beats?sellerId=${id}&limit=20`),
        ]);
        if (userRes.ok) {
          const d = await userRes.json();
          setProducer(d.user || d);
        } else {
          setError("Producteur introuvable");
        }
        if (beatsRes.ok) {
          const d = await beatsRes.json();
          setBeats(d.beats || []);
        }
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
            <Link
              href="/producers"
              className="btn-primary px-6 py-3 rounded-full mt-4 inline-block"
            >
              Retour
            </Link>
          </div>
        </main>
      </div>
    );

  const profile = producer.sellerProfile;
  const displayName =
    profile?.artistName || producer.displayName || producer.username;
  const genres = profile?.genres?.length
    ? profile.genres
    : beats
        .flatMap((b) => b.genre)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 5);
  const totalPlays = beats.reduce((s, b) => s + b.plays, 0);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/producers"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold"
          >
            <ChevronLeft className="w-5 h-5" /> Tous les producteurs
          </Link>
        </div>

        <section className="px-6 pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="glass rounded-3xl overflow-hidden">
              <div className="h-48 md:h-64 bg-gradient-to-br from-brand-purple/40 to-brand-gold/20 flex items-center justify-center">
                <Music className="w-24 h-24 text-white/10" />
              </div>
              <div className="px-8 pb-8 -mt-12">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-brand-dark border-4 border-brand-dark overflow-hidden flex-shrink-0">
                    {producer.avatar ? (
                      <img
                        src={producer.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-purple/30 to-brand-gold/30 flex items-center justify-center">
                        <User className="w-10 h-10 text-brand-gold" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold font-display">
                        {displayName}
                      </h1>
                      {profile?.verified && (
                        <span className="bg-brand-gold/20 text-brand-gold text-sm px-3 py-1 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {(profile?.averageRating ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                          {profile!.averageRating.toFixed(1)}
                        </span>
                      )}
                      <span>
                        {beats.length} beat{beats.length !== 1 ? "s" : ""}
                      </span>
                      {genres.length > 0 && <span>{genres.join(" · ")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/community/messages?new=${id}`}
                      className="glass rounded-xl px-5 py-3 font-semibold hover:bg-white/10 flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" /> Message
                    </Link>
                    <button className="glass rounded-xl px-5 py-3 font-semibold hover:bg-white/10 flex items-center gap-2">
                      <Heart className="w-5 h-5" /> Suivre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {profile?.bio && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-3">À propos</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Statistiques</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Music, val: beats.length, label: "Beats" },
                    {
                      icon: TrendingUp,
                      val: profile?.totalSales ?? 0,
                      label: "Ventes",
                    },
                    {
                      icon: Play,
                      val:
                        totalPlays > 999
                          ? `${(totalPlays / 1000).toFixed(0)}K`
                          : totalPlays,
                      label: "Écoutes",
                    },
                    {
                      icon: Award,
                      val:
                        (profile?.averageRating ?? 0) > 0
                          ? profile!.averageRating.toFixed(1)
                          : "—",
                      label: "Note",
                    },
                  ].map(({ icon: Icon, val, label }) => (
                    <div
                      key={label}
                      className="text-center glass rounded-xl p-4"
                    >
                      <Icon className="w-5 h-5 mx-auto mb-2 text-brand-gold" />
                      <div className="font-bold text-xl">{val}</div>
                      <div className="text-xs text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {(profile?.website || profile?.instagram) && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4">Liens</h3>
                  <div className="space-y-3">
                    {profile?.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-slate-300 hover:text-brand-gold"
                      >
                        <Globe className="w-5 h-5" /> Site web
                      </a>
                    )}
                    {profile?.instagram && (
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="text-lg">📸</span> {profile.instagram}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {genres.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="glass px-3 py-1.5 rounded-full text-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold font-display mb-6">
                Beats disponibles ({beats.length})
              </h2>
              {beats.length > 0 ? (
                <div className="space-y-4">
                  {beats.map((beat) => (
                    <div
                      key={beat.id}
                      className="glass rounded-2xl p-5 flex items-center gap-5 hover:scale-[1.01] group"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-brand-purple/20 to-brand-pink/20">
                        {beat.coverImage ? (
                          <img
                            src={beat.coverImage}
                            alt={beat.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-7 h-7 text-white/30" />
                          </div>
                        )}
                        <Link
                          href={`/product/${beat.slug}`}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl"
                        >
                          <Play className="w-6 h-6 text-brand-gold fill-current" />
                        </Link>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${beat.slug}`}
                          className="font-bold text-lg truncate hover:text-brand-gold block"
                        >
                          {beat.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="glass px-2 py-0.5 rounded">
                            {beat.bpm} BPM
                          </span>
                          {beat.genre[0] && (
                            <span className="glass px-2 py-0.5 rounded">
                              {beat.genre[0]}
                            </span>
                          )}
                          {beat.mood[0] && (
                            <span className="glass px-2 py-0.5 rounded">
                              {beat.mood[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-1 text-sm text-slate-400">
                        <Play className="w-3 h-3" />
                        {beat.plays.toLocaleString()}
                      </div>
                      <div className="text-xl font-bold text-gradient">
                        {Number(beat.basicPrice).toFixed(2)} €
                      </div>
                      <div className="flex gap-2">
                        <button className="glass rounded-xl p-2 hover:bg-brand-purple/20">
                          <Heart className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/product/${beat.slug}`}
                          className="glass rounded-xl p-2 hover:bg-brand-purple/20"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-2xl p-12 text-center">
                  <Music className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Aucun beat publié pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT.
        </div>
      </footer>
    </div>
  );
}
