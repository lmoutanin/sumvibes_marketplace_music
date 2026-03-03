"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Music, Headphones, Shield, TrendingUp, Users, Star, Play, Download, Award } from "lucide-react";
import { useBeats } from "@/hooks/useBeats";
import { usePlatformStats } from "@/hooks/useStats";
import { useMemo } from "react";

export default function Home() {
  const { stats: platformStats } = usePlatformStats();
  
  // Mémoïser les filtres pour éviter les re-renders
  const beatFilters = useMemo(() => ({ sort: 'latest' as const, limit: 3 }), []);
  const { beats: featuredBeats, loading: beatsLoading } = useBeats(beatFilters);
  
  const stats = [
    { value: platformStats ? `${Math.floor(platformStats.totalBeats / 1000)}K+` : "10K+", label: "Productions disponibles" },
    { value: platformStats ? `${Math.floor(platformStats.activeProducers / 1000)}K+` : "5K+", label: "Producteurs actifs" },
    { value: platformStats ? `${Math.floor(platformStats.totalSales / 1000)}K+` : "50K+", label: "Téléchargements" },
    { value: platformStats ? `${Math.round(platformStats.averageRating * 20)}%` : "98%", label: "Satisfaction client" },
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

  const testimonials = [
    {
      name: "DJ Kenzo",
      role: "Producteur Hip-Hop",
      avatar: "👨🏿‍🎤",
      text: "SUMVIBES a transformé ma carrière. J'ai vendu plus de 200 beats en 3 mois !",
      rating: 5,
    },
    {
      name: "Lisa M.",
      role: "Artiste R&B",
      avatar: "👩🏽‍🎤",
      text: "La qualité des prods et la simplicité d'achat sont inégalées. Mon album entier vient d'ici.",
      rating: 5,
    },
    {
      name: "MaxBeat Studio",
      role: "Label Indépendant",
      avatar: "🎹",
      text: "Un écosystème pro qui respecte les artistes. Interface fluide, catalogue varié.",
      rating: 5,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-24 text-center md:py-40 overflow-hidden">
          {/* Animated background elements */}
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
              <span className="text-gradient font-normal">Prods d’Exception</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-base text-white/80 md:text-xl leading-relaxed font-light">
              La marketplace premium pour les compositeurs visionnaires et les artistes en quête d’excellence.
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
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
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

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {beatsLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-3xl p-5 animate-pulse">
                  <div className="aspect-square bg-white/5 rounded-2xl mb-5"></div>
                  <div className="h-6 bg-white/5 rounded mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-2/3"></div>
                </div>
              ))
            ) : featuredBeats.length > 0 ? (
              featuredBeats.map((beat) => (
                <div key={beat.id} className="glass group relative overflow-hidden rounded-3xl p-5 transition-all hover:-translate-y-3 hover:shadow-2xl hover:shadow-brand-purple/30">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20">
                    {beat.coverImage ? (
                      <img src={beat.coverImage} alt={beat.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="w-20 h-20 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/product/${beat.slug}`}
                        aria-label={`Écouter ${beat.title}`}
                        className="rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark p-5 text-black shadow-2xl hover:scale-110 transition-transform glow-gold"
                      >
                        <Play className="h-8 w-8 fill-current" />
                      </Link>
                    </div>
                    <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full text-xs font-bold text-brand-gold">
                      NEW
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="font-bold text-xl mb-1">{beat.title}</h3>
                    <p className="text-sm text-slate-400 mb-1">Prod. by {beat.seller.displayName || beat.seller.username}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <span className="glass px-2 py-1 rounded">{beat.bpm} BPM</span>
                      <span className="glass px-2 py-1 rounded">{beat.genre}</span>
                      {beat.mood && <span className="glass px-2 py-1 rounded">{beat.mood}</span>}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <span className="text-2xl font-bold text-gradient">{Number(beat.basicPrice ?? 0).toFixed(2)} €</span>
                        <span className="text-xs text-slate-500 ml-2">Licence Basic</span>
                      </div>
                      <Link
                        href={`/product/${beat.slug}`}
                        className="glass rounded-xl px-5 py-2 text-sm font-semibold hover:bg-brand-purple/20 hover:border-brand-purple/30 transition-all"
                      >
                        Acheter
                      </Link>
                    </div>
                  </div>
                </div>
              ))
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

        {/* Testimonials Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold font-display mb-4">Ils nous font confiance ⭐</h2>
            <p className="text-xl text-slate-400">Des milliers d’artistes satisfaits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass p-8 rounded-3xl hover:scale-105 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-8 h-8 text-brand-gold" />
                <span className="text-2xl font-bold text-gradient">SUMVIBES</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                La marketplace premium pour les compositeurs visionnaires et les artistes en quête d’excellence.
              </p>
              <div className="flex gap-4">
                <Link href="/community" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10">
                  <span className="text-lg">𝕏</span>
                </Link>
                <Link href="/community" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10">
                  <span className="text-lg">IG</span>
                </Link>
                <Link href="/community" className="glass w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10">
                  <span className="text-lg">YT</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Plateforme</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/catalogue" className="hover:text-brand-gold">Catalogue</Link></li>
                <li><Link href="/producers" className="hover:text-brand-gold">Producteurs</Link></li>
                <li><Link href="/community" className="hover:text-brand-gold">Communauté</Link></li>
                <li><Link href="/blog" className="hover:text-brand-gold">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/help" className="hover:text-brand-gold">Aide</Link></li>
                <li><Link href="/cgv" className="hover:text-brand-gold">CGV</Link></li>
                <li><Link href="/privacy" className="hover:text-brand-gold">Confidentialité</Link></li>
                <li><Link href="/contact" className="hover:text-brand-gold">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-slate-500 text-sm">
            © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés. | Fait avec 💜 pour les artistes
          </div>
        </div>
      </footer>
    </div>
  );
}

