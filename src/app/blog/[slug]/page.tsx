"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, BookOpen } from "lucide-react";

export default function BlogPostPage() {
  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8">
            <ChevronLeft className="w-5 h-5" /> Retour au blog
          </Link>

          <div className="glass rounded-3xl p-16 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-6 stroke-1" />
            <h1 className="text-2xl font-bold font-display mb-3">Article à venir</h1>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Cet article n&apos;est pas encore disponible. Notre équipe éditoriale travaille sur ce contenu.
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
