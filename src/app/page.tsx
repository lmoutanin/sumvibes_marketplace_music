"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import {
  Music, Shield, TrendingUp, Users, Star, Play, Pause,
  Crown, Check, Zap, Heart, Lock, Gem, ArrowRight
} from "lucide-react";
import { useBeats } from "@/hooks/useBeats";
import { Avatar } from "@/components/ui/Avatar";
import { resolveFileUrl } from "@/lib/resolve-file";
import { useEffect, useState, useMemo } from "react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

interface TopProducer {
  totalSales: number;
  artistName: string | null;
  averageRating: number | null;
  user: { id: string; displayName: string | null; username: string; avatar: string | null };
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
  Bouyon: "from-teal-500/40 to-cyan-600/25",
  Shatta: "from-amber-500/40 to-orange-600/25",
  Dembow: "from-lime-400/40 to-yellow-600/25",
  "K-Pop": "from-pink-500/40 to-rose-600/25",
};

const FEATURES = [
  {
    icon: Music,
    title: "Catalogue premium",
    description: "Des milliers de productions HD triées par genre, BPM et ambiance.",
  },
  {
    icon: Shield,
    title: "Transactions sécurisées",
    description: "Paiements protégés et licences claires pour tous vos projets.",
  },
  {
    icon: Users,
    title: "Créateurs d'exception",
    description: "Des beatmakers sélectionnés pour leur niveau et leur originalité.",
  },
  {
    icon: Lock,
    title: "Compositions protégées",
    description: "Droits d'auteur respectés, contrats PDF générés automatiquement.",
  },
];

const SELLER_PLANS = [
  {
    name: "Freemium",
    icon: Music,
    iconClass: "text-slate-300",
    iconBg: "bg-white/5",
    price: "0€",
    period: "/ mois",
    desc: "Pour démarrer et explorer la plateforme sans engagement.",
    checkColor: "text-white/50",
    border: "border-white/10 hover:border-white/20",
    features: [
      "3 uploads par mois",
      "Fichiers MP3 uniquement",
      "30% de commission sur les ventes",
    ],
    cta: "Commencer gratuitement",
    ctaClass: "bg-white/5 text-slate-300 hover:bg-white/10",
    href: "/register",
  },
  {
    name: "Standard",
    icon: Zap,
    iconClass: "text-blue-400",
    iconBg: "bg-blue-500/10",
    price: "9,99€",
    period: "/ mois",
    desc: "Pour les beatmakers réguliers qui veulent distribuer en qualité.",
    checkColor: "text-blue-400",
    border: "border-blue-500/30 hover:border-blue-400",
    features: [
      "Uploads illimités",
      "MP3 + WAV autorisés",
      "20% de commission sur les ventes",
      "5% sur vos achats",
    ],
    cta: "Choisir Standard",
    ctaClass: "bg-blue-500 hover:bg-blue-600 text-white",
    href: "/register",
  },
  {
    name: "Premium",
    icon: Crown,
    iconClass: "text-slate-900",
    iconBg: "bg-linear-to-br from-brand-gold to-yellow-600",
    price: "14,99€",
    period: "/ mois",
    desc: "L'expérience ultime — maximisez vos revenus, gardez tout.",
    checkColor: "text-brand-gold",
    border: "border-brand-gold/40 hover:border-brand-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]",
    badge: "Populaire",
    features: [
      "Uploads illimités (MP3, WAV, Trackouts)",
      "0% de commission sur les ventes",
      "0% sur vos achats",
      "Ventes Exclusives autorisées",
      "Badge Pro + mise en avant profil",
    ],
    cta: "Passer Premium",
    ctaClass: "bg-linear-to-r from-brand-gold to-yellow-500 text-slate-900 font-black hover:from-yellow-400",
    href: "/register",
    highlight: true,
  },
];

export default function Home() {
  const { playBeat, activeBeat, isPlaying } = useAudioPlayer();
  const [topProducers, setTopProducers] = useState<TopProducer[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setTopProducers(d.topProducers || []))
      .catch(() => {});
  }, []);

  const beatFilters = useMemo(() => ({ sort: "latest" as const, limit: 12 }), []);
  const { beats, loading: beatsLoading } = useBeats(beatFilters);

  // Duplicate for seamless looping
  const tickerBeats = beats.length > 0 ? [...beats, ...beats] : [];
  const tickerProducers = topProducers.length > 0 ? [...topProducers, ...topProducers] : [];

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        {/* ── Hero ── */}
        <section className="relative px-6 py-24 text-center md:py-40 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10">
            <div className="inline-block mb-6">
              <span className="glass px-4 py-2 rounded-none text-sm font-medium text-brand-gold">
                La marketplace #1 des producteurs
              </span>
            </div>

            <h1 className="mx-auto max-w-5xl text-6xl font-light tracking-wide md:text-8xl font-display leading-tight">
              Élevez votre son avec des{" "}
              <span className="text-gradient font-normal">Prods d&apos;Exception</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-base text-white/80 md:text-xl leading-relaxed font-light">
              La marketplace premium pour les compositeurs visionnaires et les artistes en quête d&apos;excellence.
              Achetez, vendez et collaborez dans un écosystème sécurisé et transparent.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                href="/catalogue"
                className="btn-primary group relative rounded-none bg-linear-to-r from-brand-purple to-brand-pink px-10 py-5 font-bold text-white text-lg shadow-2xl hover:shadow-brand-purple/50 hover:scale-105 flex items-center gap-3"
              >
                <Music className="w-5 h-5" />
                Explorez le catalogue
              </Link>
              <Link
                href="/seller/dashboard"
                className="glass rounded-none px-10 py-5 font-bold text-lg hover:bg-white/10 flex items-center gap-3 group"
              >
                <TrendingUp className="w-5 h-5 group-hover:text-brand-gold" />
                Vendez vos créations
              </Link>
            </div>
          </div>
        </section>

        {/* ── Vibe du moment – beats ticker ── */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold font-display mb-1">Vibe du moment</h2>
                <p className="text-slate-400 text-sm">Les dernières productions ajoutées</p>
              </div>
              <Link href="/catalogue" className="text-brand-gold hover:text-brand-gold-dark font-semibold flex items-center gap-2 group text-sm">
                Voir tout <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden">
            {beatsLoading ? (
              <div className="flex gap-4 px-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-48 shrink-0 glass rounded-2xl p-4 animate-pulse">
                    <div className="w-full aspect-square rounded-xl bg-white/5 mb-3" />
                    <div className="h-4 bg-white/5 rounded mb-2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : tickerBeats.length > 0 ? (
              <div className="ticker-track flex gap-4 px-6" style={{ width: "max-content" }}>
                {tickerBeats.map((beat, i) => {
                  const genre0 = Array.isArray(beat.genre) ? beat.genre[0] ?? "" : beat.genre ?? "";
                  const gradient = GENRE_GRADIENT[genre0] ?? "from-brand-purple/30 to-brand-pink/25";
                  const isActive = activeBeat?.id === beat.id;
                  return (
                    <div key={`${beat.id}-${i}`} className="w-48 shrink-0 glass rounded-2xl p-4 group cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
                      <div className={`relative w-full aspect-square rounded-xl bg-linear-to-br ${gradient} overflow-hidden mb-3`}>
                        {beat.coverImage ? (
                          <Image src={resolveFileUrl(beat.coverImage)} alt={beat.title} fill sizes="192px" className="object-cover" />
                        ) : (
                          <Music className="w-8 h-8 text-white/20 absolute inset-0 m-auto" />
                        )}
                        <button
                          onClick={() => playBeat({
                            id: beat.id,
                            title: beat.title,
                            slug: beat.slug,
                            mp3FileUrl: beat.mp3FileUrl,
                            previewUrl: beat.previewUrl,
                            audioUrl: beat.audioUrl,
                            coverImage: beat.coverImage,
                            basicPrice: beat.basicPrice,
                            seller: beat.seller,
                          })}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isActive && isPlaying
                            ? <Pause className="w-8 h-8 text-white fill-current drop-shadow-lg" />
                            : <Play className="w-8 h-8 text-white fill-current drop-shadow-lg ml-1" />}
                        </button>
                        {isActive && (
                          <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center">
                            {isPlaying
                              ? <Pause className="w-2.5 h-2.5 text-slate-900 fill-current" />
                              : <Play className="w-2.5 h-2.5 text-slate-900 fill-current ml-0.5" />}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-brand-gold transition-colors">{beat.title}</h3>
                      <Link href={`/producers/${beat.seller.id}`} className="text-xs text-slate-400 hover:text-brand-gold line-clamp-1 block mt-0.5">
                        {beat.seller.displayName || beat.seller.username}
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-brand-gold font-bold text-sm">{Number(beat.basicPrice ?? 0).toFixed(2)}€</span>
                        {genre0 && <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{genre0}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8">Aucun beat disponible pour le moment</p>
            )}
          </div>
        </section>

        {/* ── Top créateurs ticker ── */}
        {tickerProducers.length > 0 && (
          <section className="py-12">
            <div className="mx-auto max-w-7xl px-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold font-display mb-1">Top créateurs</h2>
                  <p className="text-slate-400 text-sm">Les producteurs les plus populaires de la plateforme</p>
                </div>
                <Link href="/producers" className="text-brand-gold hover:text-brand-gold-dark font-semibold flex items-center gap-2 group text-sm">
                  Voir tout <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="ticker-track flex gap-5 px-6" style={{ width: "max-content" }}>
                {tickerProducers.map((producer, i) => {
                  const name = producer.artistName || producer.user.displayName || producer.user.username;
                  const rankStyle =
                    i % (tickerProducers.length / 2) === 0 ? "from-brand-gold to-yellow-500 text-black" :
                    i % (tickerProducers.length / 2) === 1 ? "from-slate-300 to-slate-400 text-black" :
                    i % (tickerProducers.length / 2) === 2 ? "from-amber-600 to-amber-500 text-black" :
                    "from-brand-purple to-brand-pink text-white";
                  return (
                    <Link
                      key={`${producer.user.id}-${i}`}
                      href={`/producers/${producer.user.id}`}
                      className="shrink-0 glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all group min-w-55"
                    >
                      <div className="relative">
                        <Avatar src={producer.user.avatar} name={name} size={48} />
                        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-linear-to-br ${rankStyle} flex items-center justify-center text-[10px] font-black shadow`}>
                          #{(i % (tickerProducers.length / 2)) + 1}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate group-hover:text-brand-gold transition-colors">{name}</div>
                        {producer.averageRating && producer.averageRating > 0 ? (
                          <div className="flex items-center gap-1 text-xs text-brand-gold mt-0.5">
                            <Star className="w-3 h-3 fill-brand-gold" />
                            <span>{Number(producer.averageRating).toFixed(1)}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {producer.totalSales} vente{producer.totalSales !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── SUMVIBES C'EST QUOI ? ── */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold font-display mb-4">SUMVIBES C&apos;EST QUOI&nbsp;?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Une plateforme pensée par des musiciens, pour des musiciens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="glass p-8 rounded-3xl hover:scale-105 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-purple/20 to-brand-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                  <feature.icon className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="glass relative overflow-hidden rounded-3xl p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-linear-to-br from-brand-purple/20 to-brand-pink/20 pointer-events-none" />
            <div className="relative z-10">
              <Gem className="w-16 h-16 mx-auto mb-6 text-brand-gold" />
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-8 max-w-2xl mx-auto">
                Rejoignez la communauté SUMVIBES et accédez à des productions en exclusivité
              </h2>
              <Link
                href="/register"
                className="btn-primary rounded-none bg-white px-10 py-5 font-bold text-black text-lg hover:scale-105 inline-flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                Créer mon compte gratuitement
              </Link>
            </div>
          </div>
        </section>

        {/* ── Abonnements ── */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold font-display mb-4">
              Passez à la vitesse <span className="text-gradient">supérieure</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos ambitions et gardez jusqu&apos;à 100&nbsp;% de vos revenus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {SELLER_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`glass rounded-3xl p-8 border relative overflow-hidden flex flex-col transition-all ${plan.border} ${plan.highlight ? "md:-translate-y-4" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-brand-gold text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                    {plan.badge}
                  </div>
                )}
                {plan.highlight && (
                  <div className="absolute inset-0 bg-linear-to-br from-brand-gold/5 via-transparent to-transparent pointer-events-none" />
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center`}>
                      <plan.icon className={`w-6 h-6 ${plan.iconClass}`} />
                    </div>
                    <h3 className={`text-2xl font-bold font-display ${plan.highlight ? "text-transparent bg-clip-text bg-linear-to-r from-brand-gold to-yellow-400" : "text-white"}`}>
                      {plan.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8 text-sm text-slate-300 grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.checkColor}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-auto w-full py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${plan.ctaClass}`}
                >
                  {plan.cta}
                  {plan.highlight && <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
