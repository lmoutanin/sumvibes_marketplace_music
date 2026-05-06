"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

const CATEGORIES = ["Tous", "Actualités", "Tutoriels", "Interviews", "Tendances", "Conseils"];

export default function BlogPage() {
  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Blog & <span className="text-gradient">News</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Actualités, tutoriels et tendances du monde de la production musicale
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={cat === "Tous" ? "/blog" : `/blog/category/${cat.toLowerCase()}`}
                  className="glass px-4 py-2 rounded-none text-sm hover:bg-white/10 hover:text-brand-gold"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="glass rounded-3xl p-16 text-center">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-6 stroke-1" />
              <h2 className="text-2xl font-bold font-display mb-3">Articles à venir</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Notre équipe prépare des articles, tutoriels et interviews exclusifs. Revenez bientôt.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
