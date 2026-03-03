"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Music, Shield, Headphones, Users, TrendingUp, Heart, Globe, Zap, Award } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Transparence",
      description: "Commissions claires, licences détaillées et paiements sécurisés. Pas de surprise.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Créé par des musiciens pour des musiciens. Chaque fonctionnalité est pensée pour vous.",
    },
    {
      icon: Globe,
      title: "Accessibilité",
      description: "Une plateforme ouverte à tous, mobile-first, accessible partout dans le monde.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Technologies de pointe pour une expérience fluide : streaming HD, analytics en temps réel.",
    },
  ];

  const timeline = [
    { year: "2024", event: "Naissance de l'idée SUMVIBES", description: "Xavier Jarvis imagine une marketplace qui respecte les artistes." },
    { year: "2025", event: "Développement & Beta", description: "Construction de la plateforme avec les retours de la communauté." },
    { year: "2026", event: "Lancement officiel", description: "SUMVIBES ouvre ses portes aux compositeurs et artistes du monde entier." },
    { year: "2027", event: "Expansion internationale", description: "Nouvelles fonctionnalités, partenariats et communauté grandissante." },
  ];

  const team = [
    { name: "Xavier Jarvis", role: "Fondateur & CEO", emoji: "👨🏿‍💼", description: "Visionnaire passionné de musique et d'entrepreneuriat." },
    { name: "L'équipe Tech", role: "Développement", emoji: "💻", description: "Des développeurs passionnés qui construisent l'avenir de la musique." },
    { name: "La Communauté", role: "Notre force", emoji: "🎵", description: "Des milliers d'artistes et producteurs qui font vivre SUMVIBES." },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-24 text-center md:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="glass px-4 py-2 rounded-full text-sm font-medium text-brand-gold">
                🎵 Notre histoire
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
              L&apos;excellence musicale,{" "}
              <span className="text-gradient">accessible à tous</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              SUMVIBES est née d&apos;une conviction simple : chaque artiste mérite une plateforme qui respecte
              son travail, sécurise ses transactions et valorise sa créativité.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="glass rounded-3xl p-10 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold font-display mb-6">Notre Mission</h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  SUMVIBES n&apos;est pas qu&apos;une simple boutique de beats. C&apos;est un écosystème complet
                  qui facilite la mise en relation entre les <strong className="text-brand-gold">créateurs</strong> et
                  les <strong className="text-brand-gold">producteurs de contenu</strong>.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Nous croyons que la musique est un art qui mérite d&apos;être protégé et valorisé.
                  C&apos;est pourquoi nous avons construit une plateforme qui garantit la transparence
                  des échanges, la protection des droits d&apos;auteur et une expérience utilisateur
                  sans compromis.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6 text-center hover:scale-105">
                  <Music className="w-10 h-10 mx-auto mb-3 text-brand-gold" />
                  <div className="text-3xl font-bold text-gradient">10K+</div>
                  <div className="text-sm text-slate-400 mt-1">Productions</div>
                </div>
                <div className="glass rounded-2xl p-6 text-center hover:scale-105">
                  <Users className="w-10 h-10 mx-auto mb-3 text-brand-gold" />
                  <div className="text-3xl font-bold text-gradient">5K+</div>
                  <div className="text-sm text-slate-400 mt-1">Artistes</div>
                </div>
                <div className="glass rounded-2xl p-6 text-center hover:scale-105">
                  <Headphones className="w-10 h-10 mx-auto mb-3 text-brand-gold" />
                  <div className="text-3xl font-bold text-gradient">50K+</div>
                  <div className="text-sm text-slate-400 mt-1">Écoutes</div>
                </div>
                <div className="glass rounded-2xl p-6 text-center hover:scale-105">
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 text-brand-gold" />
                  <div className="text-3xl font-bold text-gradient">98%</div>
                  <div className="text-sm text-slate-400 mt-1">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">Nos Valeurs ✨</h2>
            <p className="text-xl text-slate-400">Ce qui nous guide au quotidien</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="glass p-8 rounded-3xl hover:scale-105 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 glow-purple">
                  <value.icon className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">Notre Parcours 🚀</h2>
          </div>
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 flex gap-6 items-start hover:scale-[1.02]">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-purple/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-brand-gold">{item.year}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.event}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">L&apos;équipe 💜</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="glass rounded-3xl p-8 text-center hover:scale-105">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <div className="text-brand-gold text-sm font-medium mb-3">{member.role}</div>
                <p className="text-slate-400">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="glass relative overflow-hidden rounded-3xl p-12 md:p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-pink/20"></div>
            <div className="relative z-10">
              <Award className="w-16 h-16 mx-auto mb-6 text-brand-gold" />
              <h2 className="text-4xl font-bold font-display mb-6">Prêt à nous rejoindre ?</h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Devenez membre de la communauté SUMVIBES dès aujourd&apos;hui
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  href="/register"
                  className="btn-primary rounded-full bg-white px-10 py-5 font-bold text-black text-lg hover:scale-105 flex items-center gap-3"
                >
                  <Users className="w-5 h-5" />
                  Créer mon compte
                </Link>
                <Link
                  href="/contact"
                  className="glass rounded-full px-10 py-5 font-bold text-lg hover:bg-white/10 flex items-center gap-3"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
