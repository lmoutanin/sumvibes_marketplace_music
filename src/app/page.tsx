"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Music, Headphones, Shield, TrendingUp, Users, Star, Play, Download, Award, Loader2, Heart, ShoppingCart } from "lucide-react";
import { useBeats } from "@/hooks/useBeats";
import { Avatar } from "@/components/ui/Avatar";
import { resolveFileUrl } from "@/lib/resolve-file";
import { useEffect, useState, useMemo } from "react";

interface TopProducer {
  totalSales: number;
  artistName: string | null;
  averageRating: number | null;
  user: { id: string; displayName: string | null; username: string; avatar: string | null };
}

interface HomepageStats {
  totalBeats: number;
  totalUsers: number;
  totalSales: number;
  activeProducers: number;
  topProducers: TopProducer[];
}

const GENRE_GRADIENT: Record<string, string> = {
  Trap: "from-red-500/40 to-orange-600/25",
  "Hip-Hop": "from-blue-500/40 to-cyan-600/25",
  "R&B": "from-purple-500/40 to-pink-600/25",
  Afrobeat: "from-green-500/40 to-emerald-600/25",
  Drill: "from-slate-400/40 to-zinc-600/25",
  Pop: "from-yellow-400/40 to-amber-600/25",
  Reggaeton: "from-lime-500/40 to-green-600/25",
  "Lo-Fi": "from-indigo-500/40 to-violet-600/25",
  "Boom Bap": "from-orange-500/40 to-red-600/25",
};

const GENRE_EMOJI: Record<string, string> = {
  Trap: "🔥",
  "Hip-Hop": "🎤",
  "R&B": "💜",
  Afrobeat: "🌍",
  Drill: "⚡",
  Pop: "🌟",
  Reggaeton: "🌴",
  "Lo-Fi": "🌙",
  "Boom Bap": "🥁",
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`;
  return `${n}`;
}

export default function Home() {
  const [homepageStats, setHomepageStats] = useState<HomepageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setHomepageStats(d))
      .catch(() => { })
      .finally(() => setStatsLoading(false));
  }, []);

  const beatFilters = useMemo(() => ({ sort: "latest" as const, limit: 3 }), []);
  const { beats: featuredBeats, loading: beatsLoading } = useBeats(beatFilters);

  const stats = [
    { value: homepageStats?.totalBeats, label: "Productions disponibles" },
    { value: homepageStats?.activeProducers, label: "Producteurs actifs" },
    { value: homepageStats?.totalSales, label: "Téléchargements" },
    { value: homepageStats?.totalUsers, label: "Membres inscrits" },
  ];

  const features = [
    {
      icon: Music,
      title: "Catalogue Premium",
      description: "Des milliers de beats HD triés par genre, BPM et ambiance",
    },
    {
      icon: Shield,
      title: "Transactions Sécurisées",
      description: "Paiements protégés et licences claires pour tous vos projets",
    },
    {
      icon: Headphones,
      title: "Qualité Studio",
      description: "Fichiers WAV/MP3 haute fidélité, prêts pour le mastering",
    },
    {
      icon: TrendingUp,
      title: "Dashboard Analytique",
      description: "Suivez vos ventes et performances en temps réel",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-24 text-center md:py-40 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>

          <div className="relative z-10">
            <div className="inline-block mb-6">
              <span className="glass px-4 py-2 rounded-full text-sm font-medium text-brand-gold">
                🎵 La marketplace #1 des producteurs
              </span>
            </div>

            <h1 className="mx-auto max-w-5xl text-6xl font-light tracking-wide md:text-8xl font-display leading-tight">
              Élevez votre son avec des{" "}
              <span className="text-gradient font-normal">Prods d&apos;Exception</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-base text-white/80 md:text-xl leading-relaxed font-light">
              La marketplace premium pour les compositeurs visionnaires et les artistes en quête d&apos;excellence.
              Vendez, achetez et collaborez dans un écosystème sécurisé et transparent.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                href="/catalogue"
                className="btn-primary group relative rounded-full bg-gradient-to-r from-brand-purple to-brand-pink px-10 py-5 font-bold text-white text-lg shadow-2xl hover:shadow-brand-purple/50 hover:scale-105 flex items-center gap-3"
              >
                <Music className="w-5 h-5" />
                Explorer le Catalogue
              </Link>
              <Link
                href="/seller/dashboard"
                className="glass rounded-full px-10 py-5 font-bold text-lg hover:bg-white/10 flex items-center gap-3 group"
              >
                <TrendingUp className="w-5 h-5 group-hover:text-brand-gold" />
                Vendre vos Beats
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4 max-w-5xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="glass p-6 rounded-2xl hover:scale-105">
                  <div className="text-4xl font-bold text-gradient mb-2">
                    {statsLoading || stat.value === undefined ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" />
                    ) : (
                      fmt(stat.value)
                    )}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Beats Section */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold font-display mb-3">Dernières Pépites 💎</h2>
              <p className="text-slate-400">Les productions les plus en vogue cette semaine</p>
            </div>
            <Link href="/catalogue" className="text-brand-gold hover:text-brand-gold-dark font-semibold flex items-center gap-2 group">
              Voir tout
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {beatsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-3"></div>
                  <div className="h-5 bg-white/5 rounded mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3 mx-auto mb-4"></div>
                  <div className="h-8 bg-white/5 rounded"></div>
                </div>
              ))
            ) : featuredBeats.length > 0 ? (
              featuredBeats.map((beat) => {
                const genre0 = Array.isArray(beat.genre) ? beat.genre[0] ?? "" : beat.genre ?? "";
                const mood0 = Array.isArray(beat.mood) ? beat.mood[0] ?? "" : beat.mood ?? "";
                const gradient = GENRE_GRADIENT[genre0] ?? "from-brand-purple/30 to-brand-pink/25";
                const emoji = GENRE_EMOJI[genre0] ?? "🎵";
                return (
                  <div key={beat.id} className="glass group rounded-2xl p-6 text-center hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 transition-all duration-200 relative">
                    <Link href={`/product/${beat.slug}`} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all">
                      <Heart className="w-4 h-4" />
                    </Link>
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 relative overflow-hidden`}>
                      {beat.coverImage
                        ? <Image src={resolveFileUrl(beat.coverImage)} alt={beat.title} fill sizes="64px" className="object-cover" />
                        : <span className="text-3xl">{emoji}</span>}
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-0.5 line-clamp-1 group-hover:text-brand-gold transition-colors">{beat.title}</h3>
                    <Link href={`/producers/${beat.seller.id}`} className="text-sm text-slate-400 mb-3 line-clamp-1 hover:text-brand-gold transition-colors block">
                      {beat.seller.displayName || beat.seller.username}
                    </Link>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-4 flex-wrap">
                      {beat.bpm && <span>{beat.bpm} BPM</span>}
                      {mood0 && <><span className="text-slate-700">·</span><span>{mood0}</span></>}
                      {genre0 && <><span className="text-slate-700">·</span><span>{genre0}</span></>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-brand-gold font-bold text-sm">{Number(beat.basicPrice ?? 0).toFixed(2)}€</span>
                      <div className="flex items-center gap-2">
                        <Link href={`/product/${beat.slug}`} className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center hover:bg-brand-gold/20 transition-colors">
                          <Play className="w-3.5 h-3.5 text-brand-gold fill-current ml-0.5" />
                        </Link>
                        <Link href={`/product/${beat.slug}`} className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0">
                          <ShoppingCart className="w-4 h-4" /> Voir
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400">
                Aucun beat disponible pour le moment
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold font-display mb-4">Pourquoi SUMVIBES ?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Une plateforme pensée par des musiciens, pour des musiciens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="glass p-8 rounded-3xl hover:scale-105 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                  <feature.icon className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Producers Section */}
        {!statsLoading && homepageStats && homepageStats.topProducers.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold font-display mb-4">Top Producteurs 🏆</h2>
              <p className="text-xl text-slate-400">Les créateurs les plus populaires de la plateforme</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {homepageStats.topProducers.map((producer, i) => {
                const name = producer.artistName || producer.user.displayName || producer.user.username;
                const rankStyle =
                  i === 0 ? "from-brand-gold to-yellow-500 text-black" :
                    i === 1 ? "from-slate-300 to-slate-400 text-black" :
                      i === 2 ? "from-amber-600 to-amber-500 text-black" :
                        "from-brand-purple to-brand-pink text-white";
                return (
                  <Link
                    key={producer.user.id}
                    href={`/producers/${producer.user.id}`}
                    className="glass rounded-3xl p-6 text-center hover:-translate-y-2 hover:shadow-2xl transition-all group"
                  >
                    <div className="relative inline-block mb-4">
                      <Avatar src={producer.user.avatar} name={name} size={72} className="mx-auto" />
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${rankStyle} flex items-center justify-center text-xs font-black shadow-lg`}>
                        #{i + 1}
                      </div>
                    </div>
                    <div className="font-bold text-lg mb-1 group-hover:text-brand-gold transition-colors truncate">{name}</div>
                    {producer.averageRating && producer.averageRating > 0 ? (
                      <div className="flex items-center justify-center gap-1 text-sm text-brand-gold mb-2">
                        <Star className="w-3.5 h-3.5 fill-brand-gold" />
                        <span>{Number(producer.averageRating).toFixed(1)}</span>
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-400 font-medium">
                      {producer.totalSales} vente{producer.totalSales !== 1 ? "s" : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/producers"
                className="glass px-8 py-3 rounded-full font-bold hover:border-brand-gold/50 transition-colors inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> Voir tous les producteurs
              </Link>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="glass relative overflow-hidden rounded-3xl p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-pink/20"></div>
            <div className="relative z-10">
              <Award className="w-16 h-16 mx-auto mb-6 text-brand-gold" />
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
                Prêt à révolutionner votre son ?
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Rejoignez la communauté SUMVIBES et accédez à des milliers de productions premium
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  href="/register"
                  className="btn-primary rounded-full bg-white px-10 py-5 font-bold text-black text-lg hover:scale-105 flex items-center gap-3"
                >
                  <Users className="w-5 h-5" />
                  Créer mon compte gratuitement
                </Link>
                <Link
                  href="/about"
                  className="glass rounded-full px-10 py-5 font-bold text-lg hover:bg-white/10 flex items-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

