"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, Download, FileText, Music, ArrowRight, Mail } from "lucide-react";

export default function CheckoutConfirmationPage() {
  const orderNumber = "INV-2026-0042";
  const purchases = [
    { title: "Midnight Dreams", producer: "Xavier Jarvis", license: "Premium", price: 79.99 },
    { title: "Urban Vibes", producer: "DJ Kenzo", license: "Basic", price: 39.99 },
  ];
  const total = purchases.reduce((sum, p) => sum + p.price, 0) * 1.2;

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="w-14 h-14 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Paiement <span className="text-gradient">Confirmé</span> ! 🎉
            </h1>
            <p className="text-xl text-slate-300">
              Merci pour votre achat ! Vos fichiers sont prêts à être téléchargés.
            </p>
          </div>

          {/* Order Info */}
          <div className="glass rounded-3xl p-8 mb-8 text-left">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-slate-400">Commande</div>
                <div className="font-bold text-lg font-mono">{orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Total payé</div>
                <div className="text-2xl font-bold text-gradient">{total.toFixed(2)} €</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              {purchases.map((item, i) => (
                <div key={i} className="flex items-center gap-4 glass rounded-2xl p-4">
                  <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{item.title}</div>
                    <div className="text-sm text-slate-400">Prod. by {item.producer} — Licence {item.license}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="glass rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-gold/20 hover:text-brand-gold flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button className="glass rounded-2xl p-6 hover:scale-105 flex flex-col items-center gap-3 group">
              <Download className="w-8 h-8 text-brand-gold group-hover:scale-110" />
              <span className="font-bold">Tout télécharger</span>
              <span className="text-xs text-slate-400">Fichiers + Licences</span>
            </button>
            <button className="glass rounded-2xl p-6 hover:scale-105 flex flex-col items-center gap-3 group">
              <FileText className="w-8 h-8 text-brand-gold group-hover:scale-110" />
              <span className="font-bold">Facture PDF</span>
              <span className="text-xs text-slate-400">{orderNumber}</span>
            </button>
            <button className="glass rounded-2xl p-6 hover:scale-105 flex flex-col items-center gap-3 group">
              <Mail className="w-8 h-8 text-brand-gold group-hover:scale-110" />
              <span className="font-bold">Email envoyé</span>
              <span className="text-xs text-slate-400">Vérifiez votre boîte</span>
            </button>
          </div>

          {/* Info Notice */}
          <div className="glass rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold mb-3">📋 Important :</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Vos fichiers sont disponibles à tout moment dans votre espace &quot;Téléchargements&quot;.</li>
              <li>• La licence d&apos;utilisation au format PDF accompagne chaque fichier.</li>
              <li>• Un email récapitulatif vous a été envoyé avec tous les détails.</li>
              <li>• Pour toute question, contactez notre support.</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/account/downloads" className="btn-primary rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark px-8 py-4 font-bold text-black hover:scale-105 flex items-center gap-3">
              Mes téléchargements
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/catalogue" className="glass rounded-full px-8 py-4 font-bold hover:bg-white/10 flex items-center gap-3">
              <Music className="w-5 h-5" />
              Continuer l&apos;exploration
            </Link>
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
