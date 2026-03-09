"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Music, Trash2, ShoppingCart, ArrowRight, Tag, Shield, Loader2, Briefcase } from "lucide-react";
import { resolveFileUrl } from "@/lib/resolve-file";



export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, removeFromCart } = useCart();

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  console.log(cart);

  const subtotal = cart.total;

  // Get current plan status
  const plan = user?.subscription?.plan || "FREEMIUM";
  const isPremium = plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY";
  const isStandard = plan === "STANDARD_MONTHLY" || plan === "STANDARD_YEARLY";

  // Calculate platform fee
  const feeRate = isPremium ? 0 : isStandard ? 0.05 : 0.10;
  const platformFee = subtotal * feeRate;

  // Calculate tax (20% on subtotal + platform fee)
  const tax = ((subtotal + platformFee) * 0.2).toFixed(2);

  // Final total
  const total = (subtotal + platformFee + parseFloat(tax)).toFixed(2);

  if (!user) {
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Connectez-vous pour voir votre panier</h1>
            <Link href="/login" className="text-brand-gold hover:underline">
              Se connecter
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
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
            Votre Panier <span className="text-gradient">🛒</span>
          </h1>
          <p className="text-slate-400 mb-10">{cart.count} article{cart.count > 1 ? "s" : ""} dans votre panier</p>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-brand-gold animate-spin" />
              <p className="text-slate-400">Chargement...</p>
            </div>
          ) : cart.count > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => {
                  const isService = !!item.service;
                  const target = item.service || item.beat;
                  if (!target) return null;

                  return (
                    <div key={item.id} className="glass rounded-2xl p-6 flex items-center gap-6 group hover:scale-[1.01]">
                      <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center overflow-hidden">
                        {isService ? (
                          <Briefcase className="w-8 h-8 text-white/30" />
                        ) : (target as any).coverImage ? (
                          <img src={resolveFileUrl((target as any).coverImage)} alt={target.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-8 h-8 text-white/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{target.title}</h3>
                        <p className="text-sm text-slate-400">
                          {isService ? "Service by " : "Prod. by "}
                          {target.seller?.sellerProfile?.artistName || "Prestataire"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span className="glass px-2 py-1 rounded">
                            {isService ? `Service ${(target as any).category}` : `Licence ${item.licenseType || "Standard"}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gradient">{item.price} €</div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="mt-2 text-slate-500 hover:text-red-400 flex items-center gap-1 text-sm ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  )
                })}

                <Link href="/catalogue" className="glass rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-brand-gold hover:bg-white/5">
                  <Music className="w-5 h-5" />
                  Continuer les achats
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-3xl p-8 sticky top-28">
                  <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-slate-300">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Frais de service ({feeRate * 100}%)</span>
                      {feeRate === 0 ? (
                        <span className="text-brand-gold font-bold">0.00 €</span>
                      ) : (
                        <span>{platformFee.toFixed(2)} €</span>
                      )}
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>TVA (20%)</span>
                      <span>{tax} €</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-gradient">{total} €</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full btn-primary rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-dark py-4 font-bold text-black text-lg hover:shadow-brand-gold/50 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    Passer au paiement
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
                    <Shield className="w-4 h-4 text-brand-gold" />
                    Paiement 100% sécurisé via Stripe
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-slate-600" />
              <h2 className="text-2xl font-bold mb-3">Votre panier est vide</h2>
              <p className="text-slate-400 mb-8">Explorez notre catalogue pour trouver la prod parfaite</p>
              <Link
                href="/catalogue"
                className="btn-primary inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink px-10 py-5 font-bold text-white text-lg hover:scale-105"
              >
                <Music className="w-5 h-5" />
                Explorer le Catalogue
              </Link>
            </div>
          )}
        </section>
      </main>


    </div>
  );
}
