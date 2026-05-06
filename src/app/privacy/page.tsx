import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Shield, ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="mx-auto max-w-4xl px-6 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8">
            <ChevronLeft className="w-5 h-5" /> Retour
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <Shield className="w-10 h-10 text-brand-gold" />
            <h1 className="text-4xl md:text-5xl font-bold font-display">
              Politique de <span className="text-gradient">Confidentialité</span>
            </h1>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 space-y-8 text-slate-300 leading-relaxed">
            <p className="text-slate-400 text-sm">Dernière mise à jour : 07/04/2026</p>

            <p>
              La plateforme Sumvibes exploitée par la société par actions simplifiée Be Great au capital social de 1 000€,
              dont le siège social est situé au 431 rue de l&apos;industrie prolongée, 97122 BAIE-MAHAULT, immatriculée au
              Registre du Commerce et des Sociétés de Pointe-à-Pitre sous le numéro 991 411 356, (ci-après désigné par
              «&nbsp;nous&nbsp;», «&nbsp;notre&nbsp;», ou «&nbsp;nos&nbsp;») s&apos;engage à protéger et à respecter votre vie privée.
              Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons, et protégeons les données
              personnelles que vous nous fournissez en utilisant notre site web www.sumvibes.fr, nos applications mobiles, et nos
              services (collectivement désignés par «&nbsp;Services&nbsp;»).
            </p>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">1. Données collectées</h2>
              <p className="mb-3">Nous pouvons collecter les types de données personnelles suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><span className="font-semibold text-white">Informations personnelles :</span> nom, adresse e-mail, adresse postale, numéro de téléphone, informations de paiement.</li>
                <li><span className="font-semibold text-white">Informations de compte :</span> identifiants de connexion, historique des achats, préférences utilisateur.</li>
                <li><span className="font-semibold text-white">Informations techniques :</span> adresse IP, type de navigateur, informations de connexion, fuseau horaire, systèmes d&apos;exploitation.</li>
                <li><span className="font-semibold text-white">Informations sur l&apos;utilisation :</span> historique de navigation, pages visitées, temps passé sur le site.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">2. Utilisation des données</h2>
              <p className="mb-3">Vos données personnelles peuvent être utilisées dans les buts suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fournir, opérer, et maintenir nos services.</li>
                <li>Améliorer, personnaliser, et élargir nos services.</li>
                <li>Comprendre et analyser comment vous utilisez nos services.</li>
                <li>Développer de nouveaux produits, services, caractéristiques, et fonctionnalités.</li>
                <li>Communiquer avec vous, soit directement soit à travers l&apos;un de nos partenaires, y compris pour le service client, pour vous fournir des mises à jour et des informations relatives aux services, et à des fins de marketing et de promotion.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">3. Partage des données</h2>
              <p className="mb-3">Nous ne partageons vos données personnelles avec des tiers que dans les cas suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><span className="font-semibold text-white">Consentement :</span> Nous partagerons vos données personnelles avec des tiers lorsque nous aurons obtenu votre consentement à le faire.</li>
                <li><span className="font-semibold text-white">Prestataires de services :</span> Nous pouvons partager vos données personnelles avec des fournisseurs de services tiers qui nous assistent dans la fourniture de nos services.</li>
                <li><span className="font-semibold text-white">Obligations légales :</span> Si nécessaire, nous divulguerons vos données personnelles sur demande légale ou pour se conformer à des obligations légales.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">4. Sécurité des données</h2>
              <p>
                Nous prenons la sécurité de vos données très au sérieux et avons mis en place des mesures de sécurité appropriées
                pour empêcher l&apos;accès non autorisé, la divulgation, la modification ou la destruction non autorisée de vos données.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">5. Vos droits</h2>
              <p>
                Conformément au RGPD, vous avez le droit d&apos;accéder, de rectifier, de supprimer et de limiter le traitement de
                vos données personnelles. Vous avez également le droit de vous opposer au traitement de vos données personnelles
                et le droit à la portabilité de vos données.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">6. Modifications de cette politique de confidentialité</h2>
              <p>
                Nous pouvons mettre à jour notre Politique de Confidentialité de temps à autre. Nous vous notifierons de tout
                changement en publiant la nouvelle Politique de Confidentialité sur cette page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">7. Contactez-nous</h2>
              <p>
                Si vous avez des questions sur cette politique de confidentialité, veuillez nous contacter à{" "}
                <a href="mailto:contact@sumvibes.fr" className="text-brand-gold hover:underline">contact@sumvibes.fr</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
