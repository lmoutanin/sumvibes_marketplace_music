"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { HelpCircle, ChevronDown, ChevronUp, Search, ShoppingCart, CreditCard, Music, Shield, Users, MessageCircle } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    name: "Achat & Paiement",
    icon: ShoppingCart,
    questions: [
      { q: "Comment acheter un beat sur SUMVIBES ?", a: "Parcourez notre catalogue, écoutez les previews, sélectionnez la licence souhaitée, ajoutez au panier et procédez au paiement via Stripe ou PayPal. Vos fichiers sont disponibles immédiatement après le paiement." },
      { q: "Quels modes de paiement sont acceptés ?", a: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe ainsi que PayPal. Tous les paiements sont sécurisés et cryptés." },
      { q: "Puis-je obtenir un remboursement ?", a: "En raison de la nature numérique de nos produits, les remboursements sont traités au cas par cas. Contactez notre support dans les 48h suivant l'achat pour toute demande." },
      { q: "Comment télécharger mes fichiers après achat ?", a: "Après le paiement, vos fichiers sont disponibles sur la page de confirmation et dans votre espace 'Téléchargements'. Un email avec les liens de téléchargement vous est aussi envoyé." },
    ],
  },
  {
    name: "Licences",
    icon: Shield,
    questions: [
      { q: "Quelle est la différence entre les licences ?", a: "La Licence Basic permet une utilisation limitée (5 000 copies, 100K streams). La Licence Premium offre plus de droits (50 000 copies, 500K streams, radio). La Licence Exclusive vous donne les droits complets et exclusifs sur le beat." },
      { q: "Puis-je utiliser un beat acheté pour un clip ?", a: "Oui, selon la licence choisie. La Licence Basic permet 1 clip, la Premium 3 clips, et l'Exclusive offre un usage illimité." },
      { q: "Qu'est-ce qu'une licence exclusive ?", a: "Une licence exclusive signifie que le beat est retiré de la vente et que vous en devenez le seul détenteur. Les acheteurs précédents conservent leurs droits selon leur licence." },
    ],
  },
  {
    name: "Vente & Producteurs",
    icon: Music,
    questions: [
      { q: "Comment devenir vendeur sur SUMVIBES ?", a: "Inscrivez-vous en tant que 'Compositeur / Vendeur', complétez votre profil et commencez à uploader vos beats. Chaque beat passe par une vérification qualité avant publication." },
      { q: "Quelles sont les commissions de la plateforme ?", a: "SUMVIBES prélève une commission de 15% sur chaque vente. Vous conservez 85% de vos revenus. Les frais de paiement (Stripe/PayPal) sont inclus dans cette commission." },
      { q: "Comment retirer mes revenus ?", a: "Rendez-vous dans votre Dashboard Vendeur > Demandes de retrait. Le montant minimum est de 50€. Les virements sont traités sous 3 à 5 jours ouvrés." },
    ],
  },
  {
    name: "Compte & Sécurité",
    icon: Users,
    questions: [
      { q: "Comment modifier mes informations personnelles ?", a: "Accédez à Mon Compte > Paramètres pour modifier votre profil, votre email, votre mot de passe et vos préférences de notification." },
      { q: "J'ai oublié mon mot de passe", a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Un email de réinitialisation vous sera envoyé." },
      { q: "Mes données sont-elles protégées ?", a: "Oui, SUMVIBES est conforme au RGPD. Vos données personnelles sont cryptées et ne sont jamais partagées avec des tiers sans votre consentement." },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="px-6 py-12 md:py-16 text-center">
          <div className="mx-auto max-w-4xl">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 text-brand-gold" />
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Centre d&apos;<span className="text-gradient">Aide</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Trouvez rapidement les réponses à vos questions
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'aide..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-4xl space-y-12">
            {FAQ_CATEGORIES.map((category) => {
              const filteredQuestions = category.questions.filter(
                (q) => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && filteredQuestions.length === 0) return null;

              return (
                <div key={category.name}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-brand-gold" />
                    </div>
                    <h2 className="text-2xl font-bold font-display">{category.name}</h2>
                  </div>
                  <div className="space-y-3">
                    {(searchQuery ? filteredQuestions : category.questions).map((item, i) => {
                      const id = `${category.name}-${i}`;
                      const isOpen = openItems.includes(id);
                      return (
                        <div key={i} className="glass rounded-2xl overflow-hidden">
                          <button
                            onClick={() => toggleItem(id)}
                            className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/5"
                          >
                            <span className="font-semibold pr-4">{item.q}</span>
                            {isOpen ? <ChevronUp className="w-5 h-5 text-brand-gold flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-5">
                              <p className="text-slate-300 leading-relaxed">{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-3xl glass rounded-3xl p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-brand-gold" />
            <h2 className="text-2xl font-bold mb-3">Vous n&apos;avez pas trouvé votre réponse ?</h2>
            <p className="text-slate-400 mb-6">Notre équipe support est disponible pour vous aider</p>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark px-8 py-4 font-bold text-black hover:scale-105">
              <CreditCard className="w-5 h-5" />
              Contacter le support
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
