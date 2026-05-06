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
              Conditions Générales d&apos;Utilisation et de <span className="text-gradient">Services</span>
            </h1>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 space-y-10 text-slate-300 leading-relaxed">
            <div>
              <p className="text-center font-bold text-white text-lg mb-1">CONDITIONS GÉNÉRALES D&apos;UTILISATION ET DE SERVICES</p>
              <p className="text-center text-slate-400">(PLATEFORME SUMVIBES)</p>
              <p className="text-slate-400 text-sm mt-4">Dernière mise à jour : 1er janvier 2026</p>
            </div>

            {/* Article 1 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 1 — Objet – Acceptation des CGUS</h2>
              <p className="mb-3">
                Les présentes conditions générales d&apos;utilisation et de services (CGUS) ont pour objet de définir les conditions d&apos;utilisation
                de la plateforme SUMVIBES et de services dans le cadre suivant :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Mise en relation entre acheteurs et vendeurs (marketplace)</li>
                <li>Stockage et consignation</li>
              </ul>
              <p className="mt-3">
                L&apos;acceptation des CGUS se matérialise par une case à cocher sur la plateforme lors de l&apos;inscription de l&apos;utilisateur.
                Les CGUS sont à tout moment accessibles via l&apos;application sur la page du profil de l&apos;utilisateur.
              </p>
            </div>

            {/* Article 2 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 2 — Identité de l&apos;Exploitant de la Plateforme</h2>
              <p className="mb-3">
                La plateforme est exploitée par la SAS BE GREAT, société par actions simplifiée au capital social de 1 000€, dont le siège social
                est situé 431 Rue de l&apos;Industrie prolongée 97122 Baie-Mahault, immatriculée au Registre du Commerce et des Sociétés de
                Pointe-à-Pitre sous le numéro 991 411 356 (Ci-après « Be Great »).
              </p>
              <p>
                Le service client de la plateforme SUMVIBES peut être contacté par e-mail à l&apos;adresse suivante :{" "}
                <a href="mailto:sumgoodthin@gmail.com" className="text-brand-gold hover:underline">sumgoodthin@gmail.com</a>
              </p>
            </div>

            {/* Article 3 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 3 — Définitions</h2>
              <p className="mb-3">
                Les termes et expressions identifiés par une majuscule dans le cadre du Contrat auront la signification mentionnée ci-après,
                qu&apos;ils soient employés au singulier ou au pluriel :
              </p>
              <div className="space-y-2">
                <p><span className="font-semibold text-white">Acheteurs :</span> tout utilisateur qui achète un produit par l&apos;intermédiaire de la plateforme.</p>
                <p><span className="font-semibold text-white">CGUS :</span> désigne les conditions générales d&apos;utilisation de la Plateforme par les Utilisateurs et de services SUMVIBES.</p>
                <p><span className="font-semibold text-white">Compte personnel ou Compte :</span> désigne le compte dont dispose un Utilisateur sur la Plateforme pour utiliser les fonctionnalités de la Plateforme.</p>
                <p><span className="font-semibold text-white">Contenu :</span> désigne les données, telles que les textes, les photographies, les images insérés, créés, transmis et affichés sur la Plateforme par un Utilisateur dans le cadre de l&apos;utilisation de son Compte.</p>
                <p><span className="font-semibold text-white">Contrat :</span> désigne le contrat conclu par l&apos;Utilisateur avec SUMVIBES lequel est constitué des conditions particulières mentionnées en cas d&apos;ouverture d&apos;un Compte personnel sur la Plateforme et des CGUS.</p>
                <p><span className="font-semibold text-white">SUMVIBES :</span> désigne la société qui édite et exploite la Plateforme : société par actions simplifiée au capital social de 1000 €, dont le siège social est situé au 431 Rue de l&apos;Industrie 97122 Baie-Mahault, immatriculée au Registre du Commerce et des Sociétés de Pointe-à-Pitre sous le numéro 991 411 356.</p>
                <p><span className="font-semibold text-white">Enchérisseur :</span> désigne tout Utilisateur, personne morale ou personne physique majeure ayant la capacité de contracter, et disposant d&apos;un Compte personnel qui enchérit en vue d&apos;acheter un Produit faisant l&apos;objet d&apos;une Offre sur la Plateforme.</p>
                <p><span className="font-semibold text-white">Meilleur Enchérisseur :</span> désigne l&apos;Enchérisseur qui a formulé l&apos;enchère la plus élevée pour une Offre.</p>
                <p><span className="font-semibold text-white">Offres :</span> désigne les offres pour la vente de Produits publiées par des Vendeurs par l&apos;intermédiaire de la Plateforme.</p>
                <p><span className="font-semibold text-white">Produit :</span> désigne tout produit faisant l&apos;objet d&apos;une Offre sur la Plateforme.</p>
                <p><span className="font-semibold text-white">Plateforme ou Site :</span> désigne la plateforme accessible à l&apos;adresse suivante : https://www.ENCOURS.com.</p>
                <p><span className="font-semibold text-white">Utilisateur :</span> désigne toute personne utilisant la Plateforme.</p>
                <p className="mb-2"><span className="font-semibold text-white">Vendeur :</span> désigne tout Vendeur Professionnel ou Vendeur Particulier qui publie des Offres sur la Plateforme ; les Vendeurs sont répartis en deux catégories :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Vendeur professionnel : personne morale ou physique immatriculée auprès du registre qui lui est applicable en raison de son activité professionnelle, agissant dans le cadre de son activité professionnelle habituelle et déclarée auprès des organismes fiscaux et sociaux.</li>
                  <li>Vendeur particulier : personne physique majeure ayant la capacité de contracter et n&apos;agissant pas dans le cadre d&apos;une activité professionnelle.</li>
                </ul>
                <p className="mt-2">Sont susceptibles d&apos;être assimilées à une activité professionnelle :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Revendre des objets achetés pour revendre et non pour un usage personnel.</li>
                  <li>Vendre des objets créés par le Vendeur.</li>
                  <li>Vendre régulièrement un volume important d&apos;objets, les ventes permettant de générer des bénéfices et de dégager un revenu substantiel.</li>
                </ul>
              </div>
            </div>

            {/* Article 4 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 4 — Création d&apos;un Compte Personnel</h2>
              <p className="mb-3">Pour utiliser les fonctionnalités de la Plateforme, l&apos;Utilisateur doit créer préalablement un Compte personnel.</p>

              <h3 className="font-semibold text-white mt-4 mb-2">4.1 – Procédure de création</h3>
              <p>Pour créer un Compte personnel, l&apos;Utilisateur doit se rendre sur la Plateforme et compléter les champs obligatoires du formulaire d&apos;inscription. Chaque Utilisateur ne peut créer qu&apos;un seul profil pour son compte personnel.</p>

              <h3 className="font-semibold text-white mt-4 mb-2">4.2 – Gestion des identifiants</h3>
              <p>Les identifiants, login et mot de passe, permettant d&apos;accéder au Compte personnel sont choisis par l&apos;Utilisateur. Ces identifiants sont strictement personnels et doivent être gardés secrets. En cas de perte ou de vol, il appartient à l&apos;Utilisateur de suivre la procédure de réinitialisation prévue sur la Plateforme.</p>

              <h3 className="font-semibold text-white mt-4 mb-2">4.3 – Activation du Compte personnel</h3>
              <p className="mb-2">En validant la création de son Compte personnel, l&apos;Utilisateur :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Reconnaît avoir pu vérifier et modifier, si besoin, les informations qui y sont portées ;</li>
                <li>Garantit avoir fourni des informations exactes, à jour et complètes concernant son identité ainsi que ses coordonnées.</li>
              </ul>

              <h3 className="font-semibold text-white mt-4 mb-2">4.4 – Mise à jour du Compte personnel</h3>
              <p>L&apos;Utilisateur s&apos;engage à mettre à jour régulièrement l&apos;ensemble de ses informations personnelles dans son Compte personnel afin de préserver leur exactitude.</p>
            </div>

            {/* Article 5 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 5 — Conditions de Mise en Relation entre Acheteurs et Vendeurs (Marketplace)</h2>

              <h3 className="font-semibold text-white mt-4 mb-2">5.1 – Rôle de la plateforme SUMVIBES</h3>
              <p className="mb-3">
                La plateforme SUMVIBES exploitée par la SAS Be Great intervient en qualité d&apos;intermédiaire technique et héberge la Plateforme,
                laquelle est une plateforme technique permettant de mettre en relation des Vendeurs et des Acheteurs.
              </p>
              <p className="mb-3">
                La plateforme est majoritairement rémunérée par les commissions des transactions entre utilisateurs et par les abonnements payants.
                Elle met à disposition un système d&apos;abonnement payant mensuel pour les acheteurs et les vendeurs, résiliable à tout moment.
                L&apos;abonnement est ensuite tacitement reconduit par périodes successives d&apos;un (1) mois, sauf résiliation par l&apos;Utilisateur ou par la Plateforme.
              </p>
              <p className="mb-3">
                L&apos;abonnement payant donne accès à des services complémentaires et/ou exclusifs. Les Offres sont également accessibles sans abonnement.
                Les Offres sont valables pendant la durée mentionnée sur la Plateforme.
              </p>
              <p className="mb-3">
                La Plateforme n&apos;est pas mandataire du Vendeur et n&apos;intervient pas dans le contrat de vente de ces Produits.
                La SAS BE GREAT et sa Plateforme Sumvibes n&apos;interviennent pas en cas de litige entre un Vendeur et un Acheteur.
              </p>
              <p>Tout Utilisateur a la possibilité de poser des questions sur les caractéristiques d&apos;une Offre en adressant une demande par l&apos;intermédiaire de la Plateforme.</p>

              <h3 className="font-semibold text-white mt-4 mb-2">5.2 – Référencement des Offres</h3>
              <p className="mb-3">Le Vendeur décide librement des Offres qu&apos;il souhaite proposer sur la plateforme, sous réserve notamment que ces Offres :</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Concernent des produits autorisés,</li>
                <li>Ne soient pas des Offres pour des Produits falsifiés ou dont la commercialisation est illicite,</li>
                <li>Ne contreviennent pas aux réglementations en vigueur, aux droits de tiers et à l&apos;ordre public.</li>
              </ul>
              <p className="mb-2">Il appartient en particulier au Vendeur de s&apos;assurer de :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>L&apos;exactitude et l&apos;exhaustivité des informations relatives aux Offres mentionnées sur la Plateforme,</li>
                <li>Présenter ses annonces dans le cadre de la législation et de la règlementation applicable.</li>
              </ul>

              <h3 className="font-semibold text-white mt-4 mb-2">5.3 – Obligations fiscales et sociales des Vendeurs</h3>
              <p className="mb-3">
                Le Vendeur est tenu de respecter les obligations fiscales et sociales qui lui incombent et notamment la déclaration de ses revenus à
                l&apos;administration fiscale. La plateforme Sumvibes communique aux Vendeurs chaque année un document récapitulant le montant brut
                des transactions perçu par son intermédiaire au cours de l&apos;année précédente.
              </p>
              <p className="mb-2">Les obligations fiscales et sociales auxquelles le Vendeur est susceptible d&apos;être soumis sont précisées sur :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <a href="https://www.impots.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">www.impots.gouv.fr</a> pour les obligations fiscales
                </li>
                <li>
                  <a href="https://www.urssaf.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">www.urssaf.fr</a> pour les obligations sociales
                </li>
              </ul>

              <h3 className="font-semibold text-white mt-4 mb-2">5.4 – Statut de vendeur professionnel ou particulier</h3>
              <p className="mb-3">
                Conformément à l&apos;article D111-8 du Code de la consommation, l&apos;Utilisateur est informé que les Offres sont proposées par des
                Vendeurs professionnels ou des Vendeurs particuliers. L&apos;abonnement ne confère aucun droit de propriété intellectuelle sur les
                contenus par d&apos;autres Utilisateurs et ne garantit en aucun cas la conclusion de contrats ou la réalisation de revenus.
              </p>
              <p className="mb-3">
                Par ailleurs, l&apos;Acheteur est informé qu&apos;en cas de relation contractuelle avec un Vendeur Particulier, le droit de la
                consommation ne s&apos;applique pas. En particulier :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>L&apos;Acheteur ne dispose pas de droit de rétractation au sens de l&apos;article 221-18 du Code de la consommation.</li>
                <li>L&apos;Acheteur ne dispose pas de la garantie légale de conformité des biens mentionnée aux articles 217-3 et suivants du Code de la consommation.</li>
              </ul>
              <p>
                L&apos;Acheteur peut, sous réserve du respect des conditions prévues par les textes légaux, mettre en œuvre la garantie contre les
                défauts cachés de la chose vendue (articles 1641 à 1649 du Code civil). Dans cette hypothèse, il peut choisir entre la résolution
                de la vente ou une réduction du prix de vente conformément à l&apos;article 1644 du code civil.
              </p>
            </div>

            {/* Article 6 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 6 — Processus de Commande</h2>
              <p className="mb-3">
                L&apos;Acheteur devra lire attentivement les CGUS, les conditions de vente et les accepter, avant de valider une commande sur la Plateforme.
                En validant la commande, l&apos;Acheteur déclare expressément accepter les CGUS et les conditions de vente du Vendeur sans restriction ni réserve.
              </p>
              <p className="mb-3">
                Le contrat à distance avec le Vendeur est conclu à partir du moment où l&apos;Acheteur confirme sa commande en validant le paiement.
                Une fois cette étape validée, l&apos;Acheteur ne pourra plus annuler sa commande. La vente sera définitive.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">6.1 – Conditions spécifiques au processus d&apos;enchères</h3>
              <p className="mb-3">
                Le service d&apos;enchères proposé par la Plateforme est un service de courtage aux enchères réalisé à distance par voie électronique
                qui ne relève pas du secteur régulé prévu par l&apos;article L320-2 du Code de commerce.
              </p>
              <p className="mb-2">Le processus d&apos;enchères est basé sur les principes suivants :</p>
              <ol className="list-decimal list-inside space-y-2 ml-4 mb-3">
                <li><span className="font-semibold text-white">Principe de l&apos;enchère incrémentale :</span> les enchères sont définies par incrément et ne peuvent pas être un montant aléatoire. Plus les enchères montent, plus les montants d&apos;enchères possibles augmentent également de manière incrémentale.</li>
                <li><span className="font-semibold text-white">Principe de l&apos;enchère maximale :</span> toutes les enchères sont placées selon le modèle de « l&apos;enchère maximale », qui représente le prix le plus élevé que l&apos;Enchérisseur est prêt à payer. L&apos;enchère augmentera automatiquement de manière compétitive, jusqu&apos;à l&apos;incrément supérieur de l&apos;enchère inférieure, mais jamais au-delà. Les enchères maximales sont privées.</li>
              </ol>
              <p className="mb-3">
                Pour le Meilleur Enchérisseur, la vente n&apos;est pas conclue automatiquement. Il dispose d&apos;un délai de 7 jours pour valider son enchère
                et procéder au règlement. L&apos;Enchérisseur ne peut pas annuler une commande gagnée pendant une vente aux enchères.
              </p>
            </div>

            {/* Article 7 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 7 — Signalement d&apos;un Contenu Illicite</h2>
              <p className="mb-3">
                Toute personne peut signaler à la plateforme un contenu qui lui semble illicite en adressant un message à l&apos;adresse e-mail suivante :{" "}
                <a href="mailto:sumgoodthin@gmail.com" className="text-brand-gold hover:underline">sumgoodthin@gmail.com</a>
              </p>
              <p className="mb-3">
                Le message devra être suffisamment détaillé pour permettre aux équipes de la plateforme d&apos;identifier le contenu concerné,
                l&apos;identité de la personne qui effectue la demande, ainsi que les faits ou les circonstances spécifiques et les motifs de la demande.
              </p>
              <p>
                En application de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN), la responsabilité de
                SUMVIBES ne pourra pas être engagée à raison des contenus publiés sur la Plateforme par les Vendeurs, sauf si la plateforme ne les
                rendait pas promptement inaccessibles après notification dans les conditions prévues par la LCEN.
              </p>
            </div>

            {/* Article 8 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 8 — Conditions Tarifaires des Offres</h2>
              <p className="mb-3">
                Le prix applicable est mentionné sur la Plateforme pour chaque Offre. En cas d&apos;enchères, le prix est celui issu du processus d&apos;enchères.
                Dans tous les cas, les prix sont exprimés en euros TTC. Sauf indication contraire, les prix ne comprennent pas les éventuels frais de livraison,
                lesquels sont facturés en supplément à la demande de l&apos;Acheteur une fois les produits disponibles dans le portfolio (coffre-fort) personnel de l&apos;Acheteur.
              </p>
            </div>

            {/* Article 9 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 9 — Modalités de Paiements</h2>

              <h3 className="font-semibold text-white mt-4 mb-2">L&apos;abonnement</h3>
              <p className="mb-3">
                Le prix de l&apos;abonnement est indiqué en euros toutes taxes comprises (TTC) au moment de la souscription. Le règlement est exigible
                à l&apos;avance, à chaque échéance mensuelle, par carte bancaire, PayPal, ou autre mode accepté. Tout frais bancaire ou commission
                liée au mode de paiement reste à la charge de l&apos;Utilisateur.
              </p>
              <p className="mb-3">
                La Plateforme se réserve le droit de modifier ses tarifs. L&apos;Utilisateur sera informé au moins trente (30) jours avant l&apos;entrée en
                vigueur des nouveaux tarifs et pourra résilier son abonnement avant leur application. Toute période entamée reste due et ne donne
                lieu à aucun remboursement, sauf disposition légale contraire.
              </p>
              <p className="mb-3">
                La Plateforme se réserve le droit de suspendre ou résilier un abonnement en cas de non-paiement, fraude, ou violation des CGUS,
                sans indemnité ni remboursement.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">Le règlement du produit</h3>
              <p className="mb-3">
                Le prix du produit est indiqué en euros TTC. L&apos;Acheteur règle son achat sur la Plateforme par carte bancaire ou PayPal.
              </p>
              <p className="mb-3">
                <span className="font-semibold text-white">Paiement par carte bancaire :</span> La transmission des informations personnelles et des données bancaires est entièrement
                sécurisée par le système de STRIPE qui utilise un procédé de cryptage. Ces informations sont uniquement accessibles au prestataire
                de paiement. La collecte des informations relatives à la carte bancaire est régie par les dispositions de STRIPE accessibles à{" "}
                <a href="https://stripe.com/fr/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">https://stripe.com/fr/legal/ssa</a>.
                À aucun moment, le Vendeur ou tout autre tiers ne peut accéder à vos données bancaires.
              </p>
              <p>
                <span className="font-semibold text-white">Paiement par PayPal :</span> En choisissant PayPal, l&apos;Acheteur sera automatiquement dirigé sur son compte PayPal.
                Les conditions générales d&apos;utilisation de PayPal sont accessibles à{" "}
                <a href="https://www.paypal.com/fr/webapps/mpp/ua/useragreement-full" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">https://www.paypal.com/fr/webapps/mpp/ua/useragreement-full</a>.
              </p>
            </div>

            {/* Article 10 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 10 — Paiement des Ventes aux Vendeurs</h2>
              <p className="mb-3">
                Les prix des commandes seront versés au Vendeur par virement sur un compte bancaire conformément aux conditions contractuelles
                de STRIPE que le Vendeur accepte expressément. Le paiement de chaque vente sera effectué sous déduction de la commission due
                à SUMVIBES en application de l&apos;article 5.1 des CGUS et de toute autre somme due par le Vendeur à SUMVIBES.
              </p>
              <p>
                Tout remboursement par le Vendeur d&apos;une commande payée en ligne sur la Plateforme devra être opéré par l&apos;intermédiaire de son
                Compte sur la Plateforme.
              </p>
            </div>

            {/* Article 11 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 11 — Conditions Spécifiques au Service de Consignation</h2>
              <p className="mb-3">
                Le service consignation est fourni par la plateforme sans contrepartie financière pour l&apos;Utilisateur. L&apos;utilisation de ce service
                peut être limitée et encadrée par SUMVIBES selon les conditions mentionnées sur la Plateforme.
              </p>
              <p className="mb-3">
                L&apos;Utilisateur garantit à SUMVIBES que les Produits consignés sont sa propriété et qu&apos;il est libre de les confier en dépôt à SUMVIBES.
                SUMVIBES assume les risques des Produits consignés dès leur prise de possession et assure avoir souscrit une assurance afin de
                couvrir les risques liés à la garde des Produits confiés.
              </p>
              <p className="mb-3">
                En cas de vente d&apos;un Produit consigné via la Plateforme, le Vendeur pourra autoriser SUMVIBES à transférer celui-ci sur le portfolio
                de l&apos;Acheteur. SUMVIBES s&apos;engage à restituer les Produits consignés sur demande de l&apos;Utilisateur.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">11.1 – Frais de services SUMVIBES</h3>
              <p className="mb-3">
                En contrepartie de la mise à disposition de la Plateforme, le Vendeur versera les frais de services à la plateforme SUMVIBES
                exploitée par la SAS BE GREAT au moment de l&apos;achat.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">11.2 – Modalités de délivrance des Produits à l&apos;Acheteur</h3>
              <p className="mb-3">
                Sauf demande de l&apos;Acheteur, le produit sera transféré après la vente dans le portfolio de l&apos;Acheteur.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">11.3 – Réceptions – Réclamations</h3>
              <p>
                L&apos;Acheteur dispose d&apos;un délai de 3 jours calendaires à compter de la délivrance pour formuler par e-mail toutes réserves ou
                réclamations pour non-conformité ou défaut du Produit. La demande devra être suffisamment précise et accompagnée des éléments
                justificatifs. La plateforme SUMVIBES se chargera de transmettre la réclamation au vendeur.
              </p>
            </div>

            {/* Article 12 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 12 — Droit de Rétractation du Service SUMVIBES</h2>
              <p className="mb-3">
                Conformément aux articles L221-18 et suivants du Code de la consommation, l&apos;acheteur dispose d&apos;un délai de quatorze (14) jours
                à compter de la confirmation de la commande pour exercer son droit de rétractation, sans avoir à justifier de motif ni à payer de pénalités.
              </p>
              <p className="mb-3">
                Cependant, conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne peut pas être exercé pour la
                fourniture de contenus numériques non fournis sur un support matériel, dès lors que l&apos;exécution a commencé après accord préalable
                exprès de l&apos;acheteur et renoncement exprès à son droit de rétractation.
              </p>
              <p className="mb-2">En validant la commande de contenus numériques (beats en téléchargement), l&apos;acheteur reconnaît expressément :</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>que l&apos;exécution de la fourniture du contenu commence immédiatement après la validation du paiement,</li>
                <li>qu&apos;il renonce donc à son droit de rétractation, et ne pourra en conséquence demander ni remboursement ni échange.</li>
              </ol>
            </div>

            {/* Article 13 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 13 — Les Licences</h2>
              <p className="mb-3">
                La plateforme Sumvibes exploitée par Be Great n&apos;est aucunement responsable et propriétaire des œuvres mises à disposition sur la plateforme.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">13.1 – Au profit de l&apos;Utilisateur</h3>
              <p className="mb-3">
                Les producteurs-vendeurs concèdent ou cèdent à l&apos;acheteur, pour le temps de son inscription à la Plateforme, une licence d&apos;utilisation
                ou de cession des œuvres pour le monde entier. Toute autre utilisation ou exploitation est exclue, sauf accord écrit et préalable des Parties.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">13.2 – Au profit de la plateforme SUMVIBES</h3>
              <p className="mb-3">
                L&apos;Utilisateur concède à la plateforme SUMVIBES, à titre gratuit et non-exclusif, une licence des données, telles que les textes,
                les photographies, les images insérés, créés, transmis et affichés sur la Plateforme dans le cadre de l&apos;utilisation de son Compte,
                pour le monde entier et pour la durée de l&apos;inscription de l&apos;Utilisateur sur la Plateforme.
              </p>
              <p>
                L&apos;Utilisateur vendeur garantit à la plateforme SUMVIBES qu&apos;il est titulaire des droits, autorisations ou pouvoirs nécessaires pour
                accorder cette licence.
              </p>
            </div>

            {/* Article 14 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 14 — Stockage, Sauvegarde et Suppression du Contenu</h2>
              <p className="mb-3">
                Le stockage du Contenu s&apos;effectue sur les serveurs de la plateforme SUMVIBES, ou de ses fournisseurs, uniquement pour la durée
                de l&apos;inscription à la Plateforme. La plateforme SUMVIBES n&apos;a aucune obligation de sauvegarder ou de fournir une copie du Contenu
                à l&apos;Utilisateur, lequel s&apos;engage à prendre les mesures appropriées pour en assurer une sauvegarde.
              </p>
              <p className="mb-3">
                La plateforme SUMVIBES peut être amenée à examiner tout ou partie du contenu puis à le supprimer, voire à suspendre ou à
                supprimer le Compte de l&apos;Utilisateur dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>En cas de manquement au Contrat</li>
                <li>Sur injonction d&apos;une autorité judiciaire ou administrative.</li>
              </ul>
              <p>
                En toute hypothèse, la plateforme SUMVIBES peut conserver le Contenu pendant une durée de 5 ans après la désinscription de
                l&apos;Utilisateur notamment à des fins de preuve. Les informations nécessaires au respect d&apos;obligations légales sont conservées pendant
                la durée de conservation légale.
              </p>
            </div>

            {/* Article 15 – Règles de conduite */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 15 — Règles de Conduite</h2>
              <p className="mb-3">À titre d&apos;exemple et sans que cette liste soit limitative, l&apos;Utilisateur s&apos;engage à respecter les règles suivantes :</p>

              <h3 className="font-semibold text-white mt-4 mb-2">15.1 – Règles de conduite à l&apos;égard des autres Utilisateurs et des tiers</h3>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                <li>Ne pas poster ou envoyer de messages indésirables, ni procéder à des manœuvres frauduleuses en vue d&apos;escroquer un Utilisateur, ni enchérir artificiellement sur les Offres ;</li>
                <li>Ne pas se livrer à des comportements relevant de la diffamation, de l&apos;insulte, du harcèlement, de la menace ou pouvant porter atteinte aux droits de tiers ;</li>
                <li>Ne pas publier ou diffuser un Contenu inexact, diffamant, à caractère sexuel ou contraire à la morale et aux bonnes mœurs ;</li>
                <li>Respecter les règles usuelles de courtoisie et de bienséance ;</li>
                <li>Ne pas usurper l&apos;identité d&apos;une autre personne ;</li>
                <li>Ne pas promouvoir ou fournir des instructions sur des activités illégales ;</li>
                <li>Ne pas accéder ou tenter d&apos;accéder au compte d&apos;un autre Utilisateur ;</li>
                <li>Ne pas détourner les Utilisateurs de la Plateforme.</li>
              </ul>

              <h3 className="font-semibold text-white mt-4 mb-2">15.2 – Règles de conduite à l&apos;égard de la plateforme SUMVIBES</h3>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Ne pas utiliser la Plateforme dans un but illégal ou non autorisé ;</li>
                <li>Ne pas organiser de concours via la Plateforme sans autorisation écrite et préalable ;</li>
                <li>Ne pas interférer avec ou interrompre la Plateforme ou les serveurs ;</li>
                <li>Ne pas utiliser de procédés techniques visant à récupérer ou indexer tout ou partie de la Plateforme ;</li>
                <li>Ne pas créer des profils Utilisateurs par des moyens automatisés ou frauduleux ;</li>
                <li>Ne pas transmettre des virus, des vers, des défauts, des chevaux de Troie ou d&apos;autres éléments de nature destructrice ;</li>
                <li>Ne pas s&apos;adonner à tout acte de concurrence déloyale ou de parasitisme à l&apos;encontre de la plateforme SUMVIBES ;</li>
                <li>Ne pas créer un autre compte si un précédent compte a été résilié par SUMVIBES, sauf accord exprès et préalable.</li>
              </ul>
              <p>
                Le non-respect des règles de conduite constitue un manquement grave justifiant la suppression du Contenu et du Compte.
                L&apos;Utilisateur s&apos;engage à informer immédiatement la plateforme SUMVIBES de tout acte contraire aux CGUS dont il aurait connaissance.
              </p>
            </div>

            {/* Article 16 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 16 — Garantie du Service SUMVIBES</h2>
              <p className="mb-3">
                Conformément au Code de la consommation, tout Utilisateur ayant la qualité de consommateur bénéficie de la garantie légale
                applicable aux services numériques dans les conditions suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Le consommateur dispose d&apos;un délai de deux ans à compter de la fourniture du contenu numérique ou du service numérique pour obtenir la mise en œuvre de la garantie légale de conformité en cas d&apos;apparition d&apos;un défaut de conformité.</li>
                <li>Durant un délai d&apos;un an à compter de la date de fourniture, le consommateur n&apos;est tenu d&apos;établir que l&apos;existence du défaut de conformité et non la date d&apos;apparition de celui-ci.</li>
                <li>La garantie légale de conformité emporte obligation de fournir toutes les mises à jour nécessaires au maintien de la conformité du contenu numérique ou du service numérique.</li>
              </ul>
              <p className="mb-3">
                Le consommateur peut obtenir une réduction du prix ou mettre fin au contrat en se faisant rembourser intégralement si le
                professionnel refuse de mettre le contenu numérique en conformité, si la mise en conformité est retardée de manière injustifiée,
                ne peut intervenir sans frais, occasionne un inconvénient majeur, ou si la non-conformité persiste.
              </p>
              <p>
                Le professionnel qui fait obstacle de mauvaise foi à la mise en œuvre de la garantie légale de conformité encourt une amende
                civile d&apos;un montant maximal de 300 000 euros, qui peut être porté jusqu&apos;à 10 % du chiffre d&apos;affaires moyen annuel
                (article L. 242-18-1 du code de la consommation).
              </p>
            </div>

            {/* Article 17 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 17 — Force Majeure</h2>
              <p className="mb-3">
                Aucune des Parties ne saurait voir sa responsabilité engagée pour le cas où l&apos;exécution de ses obligations serait retardée,
                restreinte ou rendue impossible du fait de la survenance d&apos;un cas de force majeure tel que défini au nouvel article 1218 du Code civil.
              </p>
              <p className="mb-3">
                Les Parties admettent comme cas de force majeure, sans que cette liste soit limitative : une grève, le blocage des moyens de
                transports ou d&apos;approvisionnements, l&apos;arrêt des réseaux de télécommunication, des circonstances sanitaires (épidémie),
                un incendie, un évènement naturel (tremblement de terre, tempête, inondation, foudre), une guerre civile ou étrangère,
                des émeutes, des attentats, piratage ou attaque informatique, toutes mesures gouvernementales empêchant l&apos;exécution des obligations.
              </p>
              <p>
                La Partie touchée par la Force majeure en avisera l&apos;autre dans les cinq (5) jours ouvrables suivant la date à laquelle elle en
                aura eu connaissance. Les Parties conviendront alors des conditions dans lesquelles l&apos;exécution du Contrat sera poursuivie.
              </p>
            </div>

            {/* Article 18 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 18 — Responsabilité</h2>
              <p className="mb-3">
                La Plateforme agit exclusivement comme intermédiaire technique entre les Utilisateurs en facilitant la mise en relation,
                le paiement et la mise à disposition des fichiers et contrats associés. Elle ne garantit pas la conclusion de contrats,
                ni la génération de revenus par l&apos;Utilisateur au titre de l&apos;abonnement.
              </p>
              <p className="mb-3">
                La Plateforme n&apos;intervient pas dans la gestion, la perception ou la répartition des droits d&apos;auteur et droits voisins.
                Ces droits relèvent de la seule responsabilité des parties concernées, lesquelles doivent effectuer leurs propres déclarations
                auprès des organismes de gestion collective compétents.
              </p>
              <p className="mb-3">
                Après la finalisation d&apos;une transaction (paiement validé et mise à disposition des fichiers et contrats), la Plateforme n&apos;assume
                plus aucune responsabilité juridique quant à l&apos;exploitation de l&apos;œuvre concernée.
              </p>
              <p>
                La responsabilité de la plateforme SUMVIBES exploitée par la SAS BE GREAT ne pourra être engagée dans le cas où l&apos;inexécution
                de ses obligations serait imputable à une mauvaise utilisation de la Plateforme par l&apos;Utilisateur, à un fait imprévisible et
                insurmontable d&apos;un tiers, ou à un cas de Force majeure.
              </p>
            </div>

            {/* Article 15 (second) – Suppression du compte */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 15 (bis) — Suppression du Compte</h2>

              <h3 className="font-semibold text-white mt-4 mb-2">Suppression du Compte personnel sans motif par l&apos;Utilisateur</h3>
              <p className="mb-3">
                Tout Utilisateur peut mettre fin à son inscription à la Plateforme à tout moment en demandant la suppression de son Compte
                depuis l&apos;application.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">Suppression du Compte de l&apos;Utilisateur par Be Great</h3>
              <p className="mb-3">
                La plateforme SUMVIBES pourra supprimer le Compte de l&apos;Utilisateur après 3 ans d&apos;inactivité en informant l&apos;Utilisateur par
                e-mail un mois avant la prise d&apos;effet de cette décision. À défaut de réponse dans ce délai, SUMVIBES pourra procéder
                immédiatement à la suppression du Compte concerné.
              </p>
              <p className="mb-3">
                Toute activité frauduleuse, illicite ou non-conforme aux CGUS de la part de l&apos;Utilisateur pourra entraîner la suspension
                temporaire de son Compte. La plateforme SUMVIBES indiquera à l&apos;Utilisateur, par e-mail, les faits et les motifs pour lesquels
                elle envisage de prendre une telle décision. La décision sera effective sauf si l&apos;Utilisateur a entre-temps remédié à la situation.
              </p>
              <p>
                En fonction de la gravité de la situation, la plateforme ne sera pas tenue de respecter un délai de préavis pour suspendre
                ou supprimer le Compte de l&apos;Utilisateur.
              </p>
            </div>

            {/* Article 19 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 19 — Données Personnelles</h2>

              <h3 className="font-semibold text-white mt-4 mb-2">19.1 – Données personnelles de l&apos;Utilisateur</h3>
              <p className="mb-3">
                Les données personnelles collectées dans le cadre de l&apos;inscription sont traitées conformément à la Politique de confidentialité
                de la Plateforme. Chaque Utilisateur dispose d&apos;un espace personnel lui permettant de consulter et télécharger ses factures.
              </p>
              <p className="mb-3">
                Tout Vendeur est tenu de respecter les obligations lui incombant en tant que responsable de traitement, et notamment le respect
                des droits des Acheteurs et en particulier leur droit d&apos;accès, d&apos;opposition et de rectification des informations les concernant.
              </p>

              <h3 className="font-semibold text-white mt-4 mb-2">19.2 – Données personnelles dans le cadre de l&apos;utilisation des fonctionnalités</h3>
              <p className="mb-3">
                Tout Utilisateur agissant en qualité de responsable de traitement s&apos;engage à respecter la réglementation applicable, et en
                particulier le règlement (UE) 2016/679 (RGPD) ainsi que la loi n°78-17 du 6 janvier 1978. Il s&apos;engage notamment à :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Traiter les données personnelles de manière licite, loyale et transparente ;</li>
                <li>Collecter les données pour des finalités déterminées, explicites et légitimes ;</li>
                <li>S&apos;assurer que les données sont adéquates, pertinentes et limitées à ce qui est nécessaire ;</li>
                <li>S&apos;assurer que les données sont exactes et tenues à jour ;</li>
                <li>Conserver les données pendant une durée n&apos;excédant pas celle nécessaire au regard des finalités ;</li>
                <li>Garantir une sécurité appropriée des données personnelles.</li>
              </ul>
            </div>

            {/* Article 20 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 20 — Opposition au Démarchage Téléphonique</h2>
              <p className="mb-3">
                Si le numéro de téléphone de l&apos;Utilisateur est recueilli, ce dernier est informé que ses coordonnées téléphoniques ne seront
                utilisées que pour la bonne gestion de son Compte et l&apos;exécution de ses commandes ou pour lui proposer de nouveaux services.
              </p>
              <p>
                Conformément aux articles L223-1 et L223-2 du Code de la consommation, l&apos;Utilisateur est informé qu&apos;il existe une liste
                d&apos;opposition au démarchage téléphonique « Bloctel » sur laquelle il est possible de s&apos;inscrire en ligne à l&apos;adresse :{" "}
                <a href="https://conso.bloctel.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">https://conso.bloctel.fr</a>
              </p>
            </div>

            {/* Article 21 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 21 — Propriété Intellectuelle – Protection des Bases de Données</h2>
              <p className="mb-3">
                Tous les éléments de la Plateforme, qu&apos;ils soient visuels ou sonores, y compris la technologie sous-jacente sont protégés par
                un droit de propriété intellectuelle. Ils sont la propriété exclusive de chacun des auteurs. Toute reproduction, représentation
                ou réutilisation, en tout ou partie, sur un quelconque support est interdite.
              </p>
              <p className="mb-3">
                L&apos;Utilisateur qui dispose d&apos;un site Internet à titre personnel et qui désire placer un lien simple renvoyant directement à la
                Plateforme, doit obligatoirement en demander l&apos;autorisation écrite et préalable, sans que cette autorisation puisse être
                considérée comme un accord implicite d&apos;affiliation.
              </p>
              <p>
                Il est interdit d&apos;extraire et/ou de réutiliser de façon systématique des parties du contenu de la Plateforme SUMVIBES sans son
                autorisation écrite et préalable. En particulier, il est interdit d&apos;utiliser des robots d&apos;aspiration de données ou tout autre
                outil similaire de collecte ou d&apos;extraction de données.
              </p>
            </div>

            {/* Article 22 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 22 — Modification des CGUS</h2>
              <p>
                La plateforme SUMVIBES exploitée par la SAS BE GREAT se réserve le droit de faire des modifications à ses CGUS. L&apos;Utilisateur
                sera informé de ces modifications au moins 15 jours calendaires avant la date d&apos;entrée en vigueur des nouvelles CGUS. À défaut
                d&apos;acceptation par l&apos;Utilisateur, celui-ci pourra mettre fin à son inscription à la Plateforme.
              </p>
            </div>

            {/* Article 23 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 23 — Réclamations – Médiation</h2>
              <p className="mb-3">
                En cas de réclamation, l&apos;Utilisateur peut contacter la plateforme via la messagerie prévue à l&apos;adresse indiquée à l&apos;article 2
                des CGUS. Toute demande sera traitée dans un délai raisonnable dans le respect des principes de transparence et d&apos;égalité de
                traitement.
              </p>
              <p className="mb-3">
                Lorsque l&apos;Utilisateur est un consommateur, il peut, en cas de litige avec la plateforme, avoir recours au médiateur de la
                consommation. La Commission Européenne a mis en place une plateforme de Règlement en Ligne des Litiges accessible à :{" "}
                <a href="https://webgate.ec.europa.eu/odr/" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">https://webgate.ec.europa.eu/odr/</a>
              </p>
              <p>
                S&apos;agissant des Utilisateurs professionnels, tout différend pourra également être soumis au Médiateur des entreprises :{" "}
                <a href="https://www.economie.gouv.fr/mediateur-des-entreprises" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">https://www.economie.gouv.fr/mediateur-des-entreprises</a>
              </p>
            </div>

            {/* Article 24 */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Article 24 — Droit Applicable – Litige</h2>
              <p>
                Les CGUS sont soumises à la loi française. En cas de traduction, la version française prévaut. La SAS BE GREAT qui exploite
                la plateforme SUMVIBES ne donne pas de garantie de conformité à la législation locale qui serait applicable dès lors que
                l&apos;Utilisateur accède à la Plateforme à partir d&apos;autres pays.
              </p>
            </div>

            {/* Contact */}
            <div className="border-t border-white/10 pt-6">
              <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
              <p>
                SAS BE GREAT — Éditrice de la plateforme SUMVIBES<br />
                431 Rue de l&apos;Industrie prolongée, 97122 Baie-Mahault<br />
                RCS Pointe-à-Pitre n° 991 411 356<br />
                Email :{" "}
                <a href="mailto:sumgoodthin@gmail.com" className="text-brand-gold hover:underline">sumgoodthin@gmail.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
