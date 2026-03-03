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
            <p className="text-slate-400 text-sm">Dernière mise à jour : 1er janvier 2026 — Conforme au RGPD</p>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">1. Responsable du traitement</h2>
              <p>Le responsable du traitement des données est la SAS BE GREAT, représentée par Xavier JARVIS, joignable à l&apos;adresse sumgoodthin@gmail.com ou au +590 691 27 20 15.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">2. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                <li><strong className="text-white">Données d&apos;inscription :</strong> nom, prénom, adresse email, nom d&apos;utilisateur, mot de passe (hashé)</li>
                <li><strong className="text-white">Données de profil :</strong> biographie, avatar, liens sociaux (facultatif)</li>
                <li><strong className="text-white">Données de paiement :</strong> traitées directement par Stripe/PayPal, jamais stockées sur nos serveurs</li>
                <li><strong className="text-white">Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (analytics)</li>
                <li><strong className="text-white">Données d&apos;utilisation :</strong> historique d&apos;achats, écoutes, favoris, messages</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">3. Finalités du traitement</h2>
              <p>Vos données sont collectées pour :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                <li>Gérer votre compte utilisateur et vos achats</li>
                <li>Traiter les transactions et générer les factures</li>
                <li>Personnaliser votre expérience sur la plateforme</li>
                <li>Vous envoyer des communications liées à vos commandes</li>
                <li>Améliorer nos services grâce aux données d&apos;analytics</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">4. Base légale</h2>
              <p>Le traitement de vos données repose sur : l&apos;exécution du contrat (pour les achats et la gestion du compte), votre consentement (pour les emails marketing), notre intérêt légitime (pour la sécurité et les analytics) et les obligations légales (facturation, fiscalité).</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">5. Durée de conservation</h2>
              <p>Vos données personnelles sont conservées pendant toute la durée de votre inscription. Les données de facturation sont conservées 10 ans conformément aux obligations légales. Les données analytics anonymisées sont conservées sans limite de durée.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">6. Vos droits (RGPD)</h2>
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                <li><strong className="text-white">Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles</li>
                <li><strong className="text-white">Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong className="text-white">Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
                <li><strong className="text-white">Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong className="text-white">Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong className="text-white">Droit à la limitation :</strong> limiter le traitement de vos données</li>
              </ul>
              <p className="mt-3">Pour exercer vos droits, contactez-nous à <a href="mailto:sumgoodthin@gmail.com" className="text-brand-gold hover:underline">sumgoodthin@gmail.com</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">7. Sécurité</h2>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement SSL/TLS sur l&apos;ensemble du site, mots de passe hashés (bcrypt), accès restreint aux données, sauvegarde régulière et monitoring des accès.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
              <p>Notre site utilise des cookies strictement nécessaires au fonctionnement du site et, avec votre consentement, des cookies analytiques pour améliorer nos services. Vous pouvez gérer vos préférences de cookies à tout moment.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">9. Contact</h2>
              <p>Pour toute question relative à la protection de vos données personnelles :<br />
                SAS BE GREAT — Xavier JARVIS<br />
                Email : <a href="mailto:sumgoodthin@gmail.com" className="text-brand-gold hover:underline">sumgoodthin@gmail.com</a><br />
                Vous pouvez également adresser une réclamation à la CNIL (Commission Nationale de l&apos;Informatique et des Libertés).</p>
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
