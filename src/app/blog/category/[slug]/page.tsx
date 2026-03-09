"use client";

import { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, Clock, ArrowRight } from "lucide-react";

const allArticles = [
  { slug: "comment-vendre-vos-beats-en-ligne", title: "Comment vendre vos beats en ligne", category: "tutoriels", excerpt: "Guide complet pour débuter la vente de productions musicales sur SUMVIBES.", readTime: "8 min", date: "28 Jan 2026", emoji: "🎹" },
  { slug: "top-10-tendances-trap-2026", title: "Top 10 des tendances Trap en 2026", category: "tendances", excerpt: "Découvrez les sonorités qui vont dominer la scène trap cette année.", readTime: "5 min", date: "25 Jan 2026", emoji: "🔥" },
  { slug: "proteger-ses-droits-auteur", title: "Protéger ses droits d'auteur", category: "conseils", excerpt: "Tout savoir sur la protection de vos œuvres musicales en France et à l'international.", readTime: "10 min", date: "20 Jan 2026", emoji: "⚖️" },
  { slug: "interview-producteur-lyon", title: "Interview : Un producteur lyonnais", category: "interviews", excerpt: "Rencontre avec un beatmaker de Lyon qui cartonne sur SUMVIBES.", readTime: "12 min", date: "18 Jan 2026", emoji: "🎤" },
  { slug: "configurer-studio-maison", title: "Configurer son home studio", category: "tutoriels", excerpt: "Les essentiels pour créer un studio professionnel chez soi avec un budget raisonnable.", readTime: "15 min", date: "15 Jan 2026", emoji: "🎛️" },
  { slug: "guide-licences-musicales", title: "Guide des licences musicales", category: "conseils", excerpt: "Comprendre les différents types de licences et comment les utiliser sur SUMVIBES.", readTime: "7 min", date: "10 Jan 2026", emoji: "📄" },
  { slug: "afrobeat-explosion-2026", title: "L'explosion de l'Afrobeat en 2026", category: "tendances", excerpt: "L'Afrobeat continue de conquérir le monde, voici les clés pour surfer sur la vague.", readTime: "6 min", date: "8 Jan 2026", emoji: "🌍" },
  { slug: "maximiser-revenus-beatmaker", title: "Maximiser ses revenus de beatmaker", category: "conseils", excerpt: "Stratégies éprouvées pour augmenter vos ventes et votre visibilité.", readTime: "9 min", date: "5 Jan 2026", emoji: "💰" },
];

const categories: Record<string, { name: string; description: string; emoji: string }> = {
  tutoriels: { name: "Tutoriels", description: "Apprenez les techniques de production, de vente et de marketing musical avec nos guides détaillés.", emoji: "📚" },
  tendances: { name: "Tendances", description: "Restez à jour avec les dernières tendances musicales, les genres émergents et les évolutions du marché.", emoji: "📈" },
  conseils: { name: "Conseils", description: "Conseils pratiques pour les producteurs et artistes : droits d'auteur, licences, stratégie commerciale.", emoji: "💡" },
  interviews: { name: "Interviews", description: "Rencontres et discussions avec les producteurs, artistes et acteurs de l'industrie musicale.", emoji: "🎙️" },
  actualites: { name: "Actualités", description: "Les dernières nouvelles de SUMVIBES, mises à jour de la plateforme et événements.", emoji: "📣" },
};

export default function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = categories[slug] || { name: slug.charAt(0).toUpperCase() + slug.slice(1), description: "Articles de cette catégorie.", emoji: "📁" };
  const articles = allArticles.filter((a) => a.category === slug);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8">
            <ChevronLeft className="w-5 h-5" /> Retour au blog
          </Link>

          {/* Header */}
          <div className="glass rounded-3xl p-8 md:p-12 mb-12">
            <div className="text-6xl mb-4">{category.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">{category.name}</h1>
            <p className="text-xl text-slate-300 max-w-2xl">{category.description}</p>
            <div className="mt-4 text-sm text-slate-400">{articles.length} article{articles.length > 1 ? "s" : ""}</div>
          </div>

          {/* Category Nav */}
          <div className="flex flex-wrap gap-3 mb-10">
            {Object.entries(categories).map(([key, cat]) => (
              <Link
                key={key}
                href={`/blog/category/${key}`}
                className={`glass px-4 py-2 rounded-full text-sm font-semibold transition-all ${key === slug ? "bg-brand-gold text-brand-purple border-brand-gold" : "hover:bg-white/10"}`}
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
          </div>

          {/* Articles */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`} className="glass rounded-2xl overflow-hidden hover:scale-[1.02] group">
                  <div className="aspect-video bg-gradient-to-br from-brand-purple/30 to-brand-gold/10 flex items-center justify-center">
                    <span className="text-5xl">{article.emoji}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span>{article.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-brand-gold">{article.title}</h3>
                    <p className="text-slate-400 text-sm">{article.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand-gold">
                      Lire <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold mb-2">Aucun article</h3>
              <p className="text-slate-400 mb-6">Aucun article n&apos;a encore été publié dans cette catégorie.</p>
              <Link href="/blog" className="btn-primary px-6 py-3 rounded-full font-semibold">
                Voir tous les articles
              </Link>
            </div>
          )}
        </div>
      </main>


    </div>
  );
}
