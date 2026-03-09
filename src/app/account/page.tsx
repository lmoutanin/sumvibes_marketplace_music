"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Download, Heart, Settings, Music, TrendingUp, Clock, ArrowRight, CreditCard, Star, Crown, Zap, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface Purchase {
  id: string;
  beat: {
    title: string;
    genre: string[];
    seller: {
      id: string;
      username: string;
      displayName?: string;
    };
  };
  license: {
    name: string;
    type: string;
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
      id: string; username: string;
      displayName?: string;
    };
  };
}

export default function AccountPage() {
  const { user, token } = useAuth();
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
          totalPurchases: purchasesData.pagination?.total || 0,
          totalDownloads: purchasesData.pagination?.total || 0,
          totalSpent: purchasesData.purchases?.reduce((sum: number, p: Purchase) => sum + Number(p.amount), 0) || 0,
        }));
      }

      if (favoritesRes.ok) {
        setFavorites(favoritesData.favorites || []);
        setStats(prev => ({
          ...prev,
          totalFavorites: favoritesData.pagination?.total || 0,
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
    { label: "Dépensé", value: `${Number(stats.totalSpent).toFixed(0)}€`, icon: CreditCard, color: "text-blue-400" },
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
  const plan = user.subscription?.plan?.replace("_MONTHLY", "").replace("_YEARLY", "") || "FREEMIUM";
  const isPremium = plan === "PREMIUM";
  const isStandard = plan === "STANDARD";

  let subIcon = <Music className="w-5 h-5 text-white" />;
  let subColor = "from-slate-600 to-slate-800";
  let textColor = "text-slate-300";
  let ringColor = "shadow-[0_0_15px_rgba(148,163,184,0.2)]";
  let borderColor = "border-white/10";

  if (isPremium) {
    subIcon = <Crown className="w-5 h-5 text-slate-900" />;
    subColor = "from-brand-gold to-yellow-500";
    textColor = "text-brand-gold";
    ringColor = "shadow-[0_0_15px_rgba(212,175,55,0.4)]";
    borderColor = "border-brand-gold/30";
  } else if (isStandard) {
    subIcon = <Zap className="w-5 h-5 text-slate-900" />;
    subColor = "from-blue-400 to-indigo-500";
    textColor = "text-blue-400";
    ringColor = "shadow-[0_0_15px_rgba(96,165,250,0.4)]";
    borderColor = "border-blue-500/30";
  }

  const expirationDate = user.subscription?.currentPeriodEnd
    ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Profile Header */}
          <div className="glass rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar src={user.avatar} name={user.username} size={96} />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold font-display">{user.displayName || user.username}</h1>
                <p className="text-slate-400">{user.email}</p>
                <div className="flex flex-col md:flex-row items-center gap-3 mt-4 justify-center md:justify-start">
                  <span className="glass px-3 py-1 rounded-full text-xs text-brand-gold font-bold">
                    Membre
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

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Chargement des données...</p>
            </div>
          ) : (
            <>
              {/* Stats KPI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statsDisplay.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-6">
                    <s.icon className={`w-8 h-8 mb-3 ${s.color}`} />
                    <div className="text-2xl font-bold text-gradient">{s.value}</div>
                    <div className="text-sm text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Favorites */}
                <div className="lg:col-span-2 glass rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-display flex items-center gap-2">
                      <Heart className="w-6 h-6 text-brand-gold" /> Vos Favoris
                    </h2>
                  </div>
                  {favorites.length > 0 ? (
                    <div className="space-y-4">
                      {favorites.map((fav) => (
                        <div key={fav.id} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0" onClick={() => window.location.href = `/catalogue?search=${fav.beat.title}`}>
                          <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-brand-gold/20 transition-colors">
                            <Music className="w-6 h-6 text-brand-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm cursor-pointer hover:text-brand-gold transition-colors">{fav.beat.title}</h4>
                            <div className="text-xs text-slate-400 mt-1">
                              <Link href={`/producers/${fav.beat.seller.id}`} className="hover:text-brand-gold transition-colors">{fav.beat.seller.displayName || fav.beat.seller.username}</Link>{fav.beat.bpm ? ` · ${fav.beat.bpm} BPM` : ""}
                            </div>
                          </div>
                          <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Vous n'avez pas encore de favoris</p>
                      <Link href="/catalogue" className="text-brand-gold text-sm mt-2 inline-block hover:underline">
                        Découvrir de nouveaux beats →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Nav + Balance */}
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-xl font-bold font-display mb-6">Navigation rapide</h2>
                  <div className="space-y-3">
                    <Link href="/account/subscriptions" className={`flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5 border ${borderColor} group`}>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${subColor} flex items-center justify-center relative ${ringColor} group-hover:scale-105 transition-transform shrink-0`}>
                        {subIcon}
                      </div>
                      <div className="flex-1 ml-2">
                        <div className={`font-bold text-sm ${textColor}`}>Abonnement Pro</div>
                        <div className={`text-xs ${textColor}/70 mt-0.5`}>
                          Gérer votre formule ({plan})
                          {expirationDate && ` • Expire le ${expirationDate}`}
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${textColor}`} />
                    </Link>

                    <Link href="/account/downloads" className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5 border border-transparent transition-colors">
                      <Download className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Téléchargements</div>
                        <div className="text-xs text-slate-400">Fichiers disponibles</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>

                    <Link href="/catalogue" className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5 border border-transparent transition-colors">
                      <TrendingUp className="w-5 h-5 text-brand-gold" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Catalogue</div>
                        <div className="text-xs text-slate-400">Découvrir de nouveaux beats</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>

                  {/* Balance / Dépensé */}
                  <Link href="/account/expenses" className="block glass rounded-xl p-4 mt-6 border border-brand-gold/20 hover:border-brand-gold/50 hover:bg-white/5 transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-slate-400">Montant total investi</div>
                        <div className="text-3xl font-bold text-gradient mt-1">{Number(stats.totalSpent).toFixed(2)} €</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-brand-gold opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-brand-gold">
                      <Star className="w-4 h-4" /> Voir tout l'historique
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Purchases */}
              <div className="glass rounded-3xl p-8 mt-8">
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-brand-gold" /> Achats récents
                </h2>
                {purchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-400 border-b border-white/10">
                          <th className="pb-3 font-semibold">Beat</th>
                          <th className="pb-3 font-semibold">Beatmaker</th>
                          <th className="pb-3 font-semibold">Licence</th>
                          <th className="pb-3 font-semibold">Prix</th>
                          <th className="pb-3 font-semibold">Date</th>
                          <th className="pb-3 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.map((purchase) => (
                          <tr key={purchase.id} className="border-b border-white/5 text-sm hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 font-semibold">
                              {purchase.beat.title}
                            </td>
                            <td className="py-4 text-slate-400">
                              <Link href={`/producers/${purchase.beat.seller?.id}`} className="hover:text-brand-gold transition-colors">
                                {purchase.beat.seller?.displayName || purchase.beat.seller?.username}
                              </Link>
                            </td>
                            <td className="py-4">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${purchase.license.name.toLowerCase().includes("exclusive") ? "bg-purple-500/20 text-purple-400" :
                                purchase.license.name.toLowerCase().includes("premium") ? "bg-brand-gold/20 text-brand-gold" :
                                  "bg-white/10 text-white"
                                }`}>
                                {purchase.license.name}
                              </span>
                            </td>
                            <td className="py-4 text-brand-gold font-bold">{Number(purchase.amount).toFixed(2)} €</td>
                            <td className="py-4 text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Pas encore d'achats sur cette période</p>
                    <Link href="/catalogue" className="text-brand-gold text-sm mt-2 inline-block hover:underline">
                      Explorez notre catalogue →
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
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
