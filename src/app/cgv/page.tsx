import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { FileText, ChevronLeft } from "lucide-react";

export default function CgvPage() {
  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8">
            <ChevronLeft className="w-5 h-5" /> Retour
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <FileText className="w-10 h-10 text-brand-gold" />
            <h1 className="text-4xl md:text-5xl font-bold font-display">
              Conditions Générales de <span className="text-gradient">Vente</span>
            </h1>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 space-y-8 text-slate-300 leading-relaxed">
            <p className="text-slate-400 text-sm">Dernière mise à jour : 1er janvier 2026</p>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 1 — Objet</h2>
              <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre la SAS BE GREAT, société éditrice de la plateforme SUMVIBES, et tout utilisateur effectuant un achat sur la plateforme. Elles s&apos;appliquent à toute transaction réalisée via le site sumvibes.com.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 2 — Produits et Services</h2>
              <p>SUMVIBES propose la vente de licences d&apos;utilisation de productions musicales (beats, compositions, toplines). Chaque produit est accompagné d&apos;une licence définissant les droits d&apos;utilisation accordés à l&apos;acheteur. Trois types de licences sont disponibles : Basic, Premium et Exclusive.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 3 — Prix et Paiement</h2>
              <p>Les prix sont indiqués en euros (€) TTC. Le paiement s&apos;effectue en ligne via les services sécurisés Stripe ou PayPal. La transaction est confirmée dès réception du paiement. Une facture électronique au format PDF est automatiquement générée et mise à disposition de l&apos;acheteur.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 4 — Livraison</h2>
              <p>Les produits numériques (fichiers audio et contrats de licence) sont livrés immédiatement après confirmation du paiement. L&apos;acheteur dispose d&apos;un accès permanent à ses achats via son espace personnel. Les fichiers sont disponibles en téléchargement dans les formats spécifiés par la licence choisie (MP3, WAV, Stems).</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 5 — Droit de Rétractation</h2>
              <p>Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique pas aux contenus numériques fournis de manière dématérialisée dont l&apos;exécution a commencé avec l&apos;accord du consommateur. Toutefois, un remboursement peut être étudié au cas par cas dans les 48 heures suivant l&apos;achat.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 6 — Commissions</h2>
              <p>SUMVIBES prélève une commission de 15% sur chaque vente réalisée par un vendeur sur la plateforme. Cette commission couvre les frais de fonctionnement, d&apos;hébergement, de paiement et de support. Le vendeur perçoit 85% du montant de chaque vente.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 7 — Propriété Intellectuelle</h2>
              <p>Les beats et compositions restent la propriété intellectuelle de leur créateur. L&apos;achat d&apos;une licence confère uniquement les droits d&apos;utilisation définis dans le contrat de licence correspondant. Toute utilisation en dehors du cadre de la licence est strictement interdite.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 8 — Responsabilité</h2>
              <p>SUMVIBES agit en tant qu&apos;intermédiaire entre vendeurs et acheteurs. La plateforme ne saurait être tenue responsable de la qualité des productions ni des litiges entre utilisateurs. SUMVIBES s&apos;engage toutefois à modérer le contenu et à garantir un environnement sûr.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 9 — Litiges</h2>
              <p>En cas de litige, les parties s&apos;engagent à rechercher une solution amiable. À défaut, le litige sera soumis aux tribunaux compétents du ressort du siège social de la SAS BE GREAT, conformément au droit français.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 10 — Contact</h2>
              <p>SAS BE GREAT — Contact : Xavier JARVIS<br />
                Email : <a href="mailto:sumgoodthin@gmail.com" className="text-brand-gold hover:underline">sumgoodthin@gmail.com</a><br />
                Téléphone : +590 691 27 20 15</p>
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
