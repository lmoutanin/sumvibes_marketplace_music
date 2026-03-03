"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BookOpen, Clock, ArrowRight, Tag } from "lucide-react";

const CATEGORIES = ["Tous", "Actualités", "Tutoriels", "Interviews", "Tendances", "Conseils"];

const MOCK_ARTICLES = [
  {
    slug: "comment-vendre-beats-en-ligne",
    title: "Comment vendre ses beats en ligne en 2026",
    excerpt: "Guide complet pour démarrer la vente de vos productions musicales sur les plateformes en ligne. De l'inscription à la première vente.",
    category: "Tutoriels",
    date: "28 Jan 2026",
    readTime: "8 min",
    image: "📝",
  },
  {
    slug: "top-10-tendances-trap-2026",
    title: "Top 10 des tendances Trap en 2026",
    excerpt: "Découvrez les sons, les techniques de production et les styles qui dominent la scène trap cette année.",
    category: "Tendances",
    date: "25 Jan 2026",
    readTime: "5 min",
    image: "🔥",
  },
  {
    slug: "interview-xavier-jarvis",
    title: "Interview exclusive : Xavier Jarvis",
    excerpt: "Le fondateur de SUMVIBES nous parle de sa vision, des défis rencontrés et de l'avenir de la plateforme.",
    category: "Interviews",
    date: "20 Jan 2026",
    readTime: "12 min",
    image: "🎤",
  },
  {
    slug: "mixer-son-beat-comme-un-pro",
    title: "Mixer son beat comme un pro : le guide ultime",
    excerpt: "Les secrets du mixage professionnel dévoilés. EQ, compression, spatialisation : maîtrisez chaque étape.",
    category: "Tutoriels",
    date: "15 Jan 2026",
    readTime: "15 min",
    image: "🎛️",
  },
  {
    slug: "lancement-sumvibes-marketplace",
    title: "SUMVIBES : une nouvelle ère pour la production musicale",
    excerpt: "Annonce officielle du lancement de SUMVIBES, la marketplace premium dédiée aux compositeurs et artistes.",
    category: "Actualités",
    date: "1 Jan 2026",
    readTime: "4 min",
    image: "🚀",
  },
  {
    slug: "proteger-ses-droits-auteur",
    title: "Protéger ses droits d'auteur en tant que beatmaker",
    excerpt: "Tout ce que vous devez savoir sur la propriété intellectuelle, les licences et la protection de vos créations.",
    category: "Conseils",
    date: "10 Jan 2026",
    readTime: "10 min",
    image: "🛡️",
  },
];

export default function BlogPage() {
  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Blog & <span className="text-gradient">News</span> 📰
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Actualités, tutoriels et tendances du monde de la production musicale
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-3 mt-8">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={cat === "Tous" ? "/blog" : `/blog/category/${cat.toLowerCase()}`}
                  className="glass px-4 py-2 rounded-full text-sm hover:bg-white/10 hover:text-brand-gold"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-7xl">
            <Link href={`/blog/${MOCK_ARTICLES[0].slug}`} className="glass rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center hover:scale-[1.01] group">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-brand-purple/30 to-brand-gold/20 flex items-center justify-center">
                <span className="text-8xl">{MOCK_ARTICLES[0].image}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="glass px-3 py-1 rounded-full text-xs text-brand-gold font-bold">{MOCK_ARTICLES[0].category}</span>
                  <span className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4" /> {MOCK_ARTICLES[0].readTime}</span>
                </div>
                <h2 className="text-3xl font-bold font-display mb-4 group-hover:text-brand-gold">{MOCK_ARTICLES[0].title}</h2>
                <p className="text-slate-400 leading-relaxed mb-4">{MOCK_ARTICLES[0].excerpt}</p>
                <div className="flex items-center gap-2 text-brand-gold font-semibold group-hover:gap-4">
                  Lire l&apos;article <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Article Grid */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_ARTICLES.slice(1).map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="glass rounded-3xl overflow-hidden hover:-translate-y-3 hover:shadow-2xl hover:shadow-brand-purple/30 group"
                >
                  <div className="aspect-video bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center">
                    <span className="text-5xl">{article.image}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="glass px-3 py-1 rounded-full text-xs text-brand-gold font-bold">{article.category}</span>
                      <span className="text-xs text-slate-500">{article.date}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-brand-gold">{article.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                      <span className="text-sm text-brand-gold font-semibold flex items-center gap-1">
                        Lire <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
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
