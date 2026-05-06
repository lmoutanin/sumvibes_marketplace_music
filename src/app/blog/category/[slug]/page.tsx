"use client";

import { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, BookOpen } from "lucide-react";

const CATEGORIES: Record<string, string> = {
  tutoriels: "Tutoriels",
  tendances: "Tendances",
  conseils: "Conseils",
  interviews: "Interviews",
  actualites: "Actualités",
};

export default function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const categoryName = CATEGORIES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8">
            <ChevronLeft className="w-5 h-5" /> Retour au blog
          </Link>

          <div className="glass rounded-3xl p-8 md:p-12 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">{categoryName}</h1>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            {Object.entries(CATEGORIES).map(([key, name]) => (
              <Link
                key={key}
                href={`/blog/category/${key}`}
                className={`glass px-4 py-2 rounded-none text-sm font-semibold transition-all ${key === slug ? "bg-brand-gold text-brand-purple border-brand-gold" : "hover:bg-white/10"}`}
              >
                {name}
              </Link>
            ))}
          </div>

          <div className="glass rounded-3xl p-16 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-6 stroke-1" />
            <h2 className="text-xl font-bold font-display mb-3">Aucun article disponible</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Aucun article n&apos;a encore été publié dans cette catégorie.
            </p>
            <Link href="/blog" className="btn-primary bg-brand-gold text-black px-8 py-3 font-bold inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Voir tous les articles
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
