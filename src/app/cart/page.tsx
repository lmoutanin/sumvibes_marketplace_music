"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Music, Trash2, ShoppingCart, ArrowRight, Tag, Shield, Loader2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, removeFromCart } = useCart();

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const subtotal = cart.total;
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

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
                {cart.items.map((item) => (
                  <div key={item.id} className="glass rounded-2xl p-6 flex items-center gap-6 group hover:scale-[1.01]">
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center overflow-hidden">
                      {item.beat.coverImage ? (
                        <img src={item.beat.coverImage} alt={item.beat.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-8 h-8 text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{item.beat.title}</h3>
                      <p className="text-sm text-slate-400">Prod. by {item.beat.seller.sellerProfile?.artistName || "Producteur"}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <span className="glass px-2 py-1 rounded">Licence {item.license?.name || "Basic"}</span>
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
                ))}

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
                      <span>TVA (20%)</span>
                      <span>{tax.toFixed(2)} €</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-gradient">{total.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Code promo"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-gold/50"
                        />
                      </div>
                      <button className="glass px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/10">
                        Appliquer
                      </button>
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

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
