"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  CreditCard,
  Lock,
  Shield,
  ChevronLeft,
  Music,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { resolveFileUrl } from "@/lib/resolve-file";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const items = cart?.items ?? [];
  const subtotal = cart?.total ?? 0;

  const requiredProfileFields = [
    { key: "firstName", label: "Prénom", value: user?.firstName },
    { key: "lastName", label: "Nom", value: user?.lastName },
    { key: "email", label: "Email", value: user?.email },
    { key: "phone", label: "Téléphone", value: user?.phone },
    { key: "address", label: "Adresse", value: user?.address },
    { key: "city", label: "Ville", value: user?.city },
    { key: "postalCode", label: "Code postal", value: user?.postalCode },
    { key: "country", label: "Pays", value: user?.country },
  ];

  const missingProfileFields = requiredProfileFields
    .filter((f) => !String(f.value ?? "").trim())
    .map((f) => f.label);
  const isProfileCompleteForPurchase = missingProfileFields.length === 0;

  // Calcul des comission selon l'abonnement
  const plan = user?.subscription?.plan || "FREEMIUM";
  const isPremium = plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY";
  const isStandard = plan === "STANDARD_MONTHLY" || plan === "STANDARD_YEARLY";

  const feeRate = isPremium ? 0 : isStandard ? 0.05 : 0.15;
  const platformFee = subtotal * feeRate;

  const tax = (subtotal + platformFee) * 0.2;
  const total = subtotal + platformFee + tax;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!isProfileCompleteForPurchase) {
      setError(
        `Merci de compléter votre profil avant achat : ${missingProfileFields.join(", ")}.`,
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      /*    const res = await fetch("/api/stripe/checkout", {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
           body: JSON.stringify({
             items: items.map((item: any) => ({
               beatId: item.beatId,
               licenseId: item.licenseId,
             })),
           }),
         });
         if (!res.ok) {
           const data = await res.json().catch(() => ({}));
           throw new Error(data.error || "Erreur lors de la création de la session de paiement");
         }
         const data = await res.json(); */

      const resPurchase = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            paymentMethod: "STRIPE",
            stripePaymentIntentId: "temp_" + Date.now(), // temporaire, remplacé par le vrai ID après paiement
            cart: cart,
          },
        }),
      });

      if (!resPurchase.ok) {
        const errData = await resPurchase.json().catch(() => ({}));
        throw new Error(
          errData.error || "Erreur lors de la création de l'achat",
        );
      }

      await clearCart();
      window.location.href = "/checkout/confirmation";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-slate-400 mb-6">
              Ajoutez des beats avant de procéder au paiement.
            </p>
            <Link
              href="/catalogue"
              className="btn-primary px-6 py-3 rounded-full"
            >
              Voir le catalogue
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />
      <main className="pt-20">
        <section className="mx-auto max-w-5xl px-6 py-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8"
          >
            <ChevronLeft className="w-5 h-5" /> Retour au panier
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
            Paiement <span className="text-gradient">Sécurisé</span> 🔒
          </h1>
          <p className="text-slate-400 mb-10">
            Finalisez votre commande en toute sécurité
          </p>

          {error && (
            <div className="glass rounded-xl p-4 border border-red-500/30 text-red-400 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          {!isProfileCompleteForPurchase && (
            <div className="glass rounded-xl p-4 border border-brand-gold/30 text-brand-gold flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Complétez votre profil pour acheter :{" "}
                  {missingProfileFields.join(", ")}.
                </p>
              </div>
              <Link
                href="/account/settings?tab=profile"
                className="relative group px-5 py-2 rounded-full font-bold text-brand-purple overflow-hidden flex items-center gap-2 flex-shrink-0 transition-all hover:scale-105 text-sm whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-brand-gold group-hover:bg-amber-400 transition-colors"></div>
                <span className="relative z-10">Compléter mon profil</span>
              </Link>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handlePayment} className="space-y-8">
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-brand-gold" /> Mode de
                    paiement
                  </h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Vous serez redirigé vers Stripe, notre partenaire de
                    paiement sécurisé, pour finaliser votre commande.
                  </p>
                  <div className="flex items-center gap-3 glass rounded-xl p-4">
                    <div className="text-3xl">💳</div>
                    <div>
                      <div className="font-bold">
                        Stripe — Paiement sécurisé
                      </div>
                      <div className="text-xs text-slate-400">
                        Visa, Mastercard, Amex, iDEAL et plus
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing info */}
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-xl font-bold mb-6">
                    Informations de facturation
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                          Prénom
                        </label>
                        <input
                          type="text"
                          placeholder="John"
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                          Nom
                        </label>
                        <input
                          type="text"
                          placeholder="Doe"
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email ?? ""}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isProfileCompleteForPurchase}
                  className="w-full btn-primary rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-dark py-5 font-bold text-black text-lg hover:shadow-brand-gold/50 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5" /> Payer {total.toFixed(2)} €
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="glass rounded-3xl p-8 sticky top-28">
                <h2 className="text-xl font-bold mb-6">Votre commande</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item: any) => {
                    const beat = item.beat;
                    const license = item.licenseType;
                    const price = item.price;
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 overflow-hidden">
                          {beat?.coverImage ? (
                            <img
                              src={resolveFileUrl(beat?.coverImage)}
                              alt={beat.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-6 h-6 text-white/30 m-auto mt-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">
                            {beat?.title ?? "Beat"}
                          </div>
                          <div className="text-xs text-slate-400">
                            Licence {item?.licenseType || null}
                          </div>
                        </div>
                        <div className="font-bold">{price} €</div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>comission de service ({feeRate * 100}%)</span>
                    <span>
                      {feeRate === 0 ? "0.00" : platformFee.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>TVA (20%)</span>
                    <span>{tax.toFixed(2)} €</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-bold text-gradient">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    "Paiement sécurisé SSL",
                    "Téléchargement immédiat",
                    "Licence PDF incluse",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <Check className="w-4 h-4 text-brand-gold flex-shrink-0" />{" "}
                      {f}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4" /> Protégé par Stripe —
                  Chiffrement 256 bits
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
