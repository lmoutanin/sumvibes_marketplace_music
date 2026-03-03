"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Download, Heart, Settings, Music, TrendingUp, Clock, ArrowRight, CreditCard, Star } from "lucide-react";

interface Purchase {
  id: string;
  beat: {
    title: string;
    genre: string;
    seller: {
      username: string;
      displayName?: string;
    };
  };
  license: {
    name: string;
  };
  amount: number;
  createdAt: string;
}

interface Favorite {
  id: string;
  beat: {
    title: string;
    bpm: number;
    genre: string;
    seller: {
      username: string;
      displayName?: string;
    };
  };
}

export default function AccountPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalDownloads: 0,
    totalFavorites: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch purchases
      const purchasesRes = await fetch('/api/purchases?limit=4', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const purchasesData = await purchasesRes.json();
      
      // Fetch favorites
      const favoritesRes = await fetch('/api/favorites?limit=3', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const favoritesData = await favoritesRes.json();

      if (purchasesRes.ok) {
        setPurchases(purchasesData.purchases || []);
        setStats(prev => ({
          ...prev,
          totalPurchases: purchasesData.total || 0,
          totalDownloads: purchasesData.total || 0,
          totalSpent: purchasesData.purchases?.reduce((sum: number, p: Purchase) => sum + p.amount, 0) || 0,
        }));
      }

      if (favoritesRes.ok) {
        setFavorites(favoritesData.favorites || []);
        setStats(prev => ({
          ...prev,
          totalFavorites: favoritesData.total || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { label: "Achats", value: stats.totalPurchases.toString(), icon: ShoppingBag, color: "text-brand-gold" },
    { label: "Downloads", value: stats.totalDownloads.toString(), icon: Download, color: "text-green-400" },
    { label: "Favoris", value: stats.totalFavorites.toString(), icon: Heart, color: "text-red-400" },
    { label: "Dépensé", value: `${stats.totalSpent.toFixed(0)}€`, icon: CreditCard, color: "text-blue-400" },
  ];

  if (!user) {
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
            <Link href="/login" className="btn-primary px-8 py-3 rounded-full">
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
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Profile Header */}
          <div className="glass rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName || user.username} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-brand-gold to-yellow-500 flex items-center justify-center text-4xl font-bold text-brand-purple">
                  {(user.displayName || user.username)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold font-display">{user.displayName || user.username}</h1>
                <p className="text-slate-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <span className="glass px-3 py-1 rounded-full text-xs text-brand-gold font-bold">
                    {user.role === 'SELLER' ? 'Vendeur' : user.role === 'ADMIN' ? 'Admin' : 'Acheteur'}
                  </span>
                  {user.createdAt && (
                    <span className="text-xs text-slate-400">
                      Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <Link href="/account/settings" className="glass px-6 py-3 rounded-full font-semibold hover:bg-white/10 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Paramètres
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsDisplay.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <s.icon className={`w-8 h-8 mx-auto mb-3 ${s.color}`} />
                <div className="text-2xl font-bold text-gradient">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Purchases */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-brand-gold" /> Achats récents
                </h2>
                <Link href="/account/downloads" className="text-brand-gold text-sm font-semibold flex items-center gap-1 hover:underline">
                  Tout voir <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="glass rounded-xl p-4 animate-pulse">
                      <div className="h-12 bg-white/5 rounded"></div>
                    </div>
                  ))
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun achat pour le moment</p>
                    <Link href="/catalogue" className="text-brand-gold text-sm hover:underline mt-2 inline-block">
                      Découvrir le catalogue
                    </Link>
                  </div>
                ) : (
                  purchases.map((purchase) => (
                    <div key={purchase.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5">
                      <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-brand-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm">{purchase.beat.title}</h4>
                        <p className="text-xs text-slate-400">
                          {purchase.beat.seller.displayName || purchase.beat.seller.username} · {purchase.beat.genre}
                        </p>
                      </div>
                      <div className="hidden md:block text-right">
                        <div className="text-xs font-bold px-2 py-0.5 rounded-full inline-block bg-brand-gold/20 text-brand-gold">
                          {purchase.license.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" /> {new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-brand-gold font-bold text-sm">{purchase.amount.toFixed(2)}€</div>
                      <button className="btn-primary px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold font-display text-lg mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Link href="/account/downloads" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <Download className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Mes téléchargements</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                  </Link>
                  <Link href="/account/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Paramètres du compte</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                  </Link>
                  <Link href="/catalogue" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <TrendingUp className="w-5 h-5 text-brand-gold" />
                    <span className="text-sm">Explorer le catalogue</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Favorites */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" /> Favoris
                </h3>
                <div className="space-y-3">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-lg bg-white/5"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/5 rounded mb-2"></div>
                          <div className="h-3 bg-white/5 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Aucun favori
                    </div>
                  ) : (
                    favorites.map((fav) => (
                      <div key={fav.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{fav.beat.title}</div>
                          <div className="text-xs text-slate-400">
                            {fav.beat.seller.displayName || fav.beat.seller.username} · {fav.beat.bpm} BPM
                          </div>
                        </div>
                        <Star className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
