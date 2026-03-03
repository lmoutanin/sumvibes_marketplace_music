"use client";

import { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, Clock, User, Share2, Heart, MessageCircle, ArrowRight } from "lucide-react";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const article = {
    title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    category: "Tutoriels",
    date: "28 Janvier 2026",
    readTime: "8 min",
    author: { name: "SUMVIBES Team", avatar: "🎵" },
    content: [
      "La production musicale a connu une révolution numérique sans précédent ces dernières années. Avec l'essor des plateformes en ligne, les compositeurs et beatmakers ont désormais la possibilité de vendre leurs créations à un public mondial, sans passer par les canaux traditionnels de l'industrie musicale.",
      "SUMVIBES s'inscrit dans cette dynamique en offrant un écosystème complet, pensé pour faciliter les échanges entre créateurs et artistes. Que vous soyez un producteur débutant ou confirmé, la plateforme vous offre tous les outils nécessaires pour monétiser votre talent.",
      "Le processus est simple : créez votre profil, uploadez vos productions avec les métadonnées appropriées (BPM, genre, mood, instruments), définissez vos prix et licences, et laissez la magie opérer. Notre algorithme de recommandation met en avant les productions de qualité auprès des artistes en recherche.",
      "La clé du succès réside dans la qualité de vos productions et la cohérence de votre catalogue. Concentrez-vous sur un ou deux genres musicaux, produisez régulièrement, et engagez-vous avec la communauté via le forum et la messagerie. Les artistes apprécient les producteurs actifs et réactifs.",
      "En termes de tarification, nous recommandons de proposer plusieurs niveaux de licences pour s'adapter à tous les budgets. La Licence Basic est idéale pour les artistes indépendants, tandis que la Licence Premium convient aux projets plus ambitieux. La Licence Exclusive, quant à elle, est réservée aux artistes souhaitant des droits complets.",
    ],
  };

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <article className="mx-auto max-w-4xl px-6 py-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8">
            <ChevronLeft className="w-5 h-5" /> Retour au blog
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/blog/category/${article.category.toLowerCase()}`} className="glass px-3 py-1 rounded-full text-xs text-brand-gold font-bold hover:bg-brand-gold/10">
                {article.category}
              </Link>
              <span className="text-sm text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">{article.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{article.author.avatar}</div>
                <div>
                  <div className="font-bold text-sm">{article.author.name}</div>
                  <div className="text-xs text-slate-400">{article.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button className="glass p-2 rounded-xl hover:bg-white/10"><Share2 className="w-5 h-5" /></button>
                <button className="glass p-2 rounded-xl hover:bg-white/10"><Heart className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* Cover */}
          <div className="glass rounded-3xl aspect-video mb-12 bg-gradient-to-br from-brand-purple/30 to-brand-gold/20 flex items-center justify-center">
            <span className="text-8xl opacity-50">📝</span>
          </div>

          {/* Content */}
          <div className="glass rounded-3xl p-8 md:p-12 mb-12">
            <div className="prose prose-invert max-w-none space-y-6">
              {article.content.map((paragraph, i) => (
                <p key={i} className="text-slate-300 leading-relaxed text-lg">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between glass rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-4">
              <button className="glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 flex items-center gap-2">
                <Heart className="w-4 h-4" /> J&apos;aime
              </button>
              <button className="glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Partager
              </button>
            </div>
            <button className="glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Commenter
            </button>
          </div>

          {/* Author Card */}
          <div className="glass rounded-3xl p-8 flex items-center gap-6 mb-12">
            <div className="text-5xl">{article.author.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">{article.author.name}</div>
              <p className="text-slate-400 text-sm">L&apos;équipe éditoriale de SUMVIBES, passionnée par la musique et la technologie.</p>
            </div>
            <Link href="/blog" className="glass rounded-xl px-4 py-2 text-sm font-semibold hover:bg-white/10">
              Tous les articles
            </Link>
          </div>

          {/* Related */}
          <div>
            <h3 className="text-2xl font-bold font-display mb-6">Articles similaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { slug: "top-10-tendances-trap-2026", title: "Top 10 des tendances Trap en 2026", category: "Tendances" },
                { slug: "proteger-ses-droits-auteur", title: "Protéger ses droits d'auteur", category: "Conseils" },
              ].map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="glass rounded-2xl p-6 hover:scale-[1.02] group">
                  <span className="glass px-3 py-1 rounded-full text-xs text-brand-gold font-bold">{related.category}</span>
                  <h4 className="font-bold mt-3 group-hover:text-brand-gold">{related.title}</h4>
                  <span className="text-sm text-brand-gold mt-2 flex items-center gap-1">Lire <ArrowRight className="w-4 h-4" /></span>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
