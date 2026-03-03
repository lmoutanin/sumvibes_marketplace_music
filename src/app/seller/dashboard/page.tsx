"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp, DollarSign, Music, Eye, ShoppingCart, Users,
  ArrowUp, ArrowDown, BarChart3, Upload, CreditCard, FileText,
  ArrowRight, Clock, Star, Loader2, Briefcase
} from "lucide-react";

interface SellerStats {
  overview: {
    totalRevenue: number;
    totalSales: number;
    rating: number;
    totalBeats: number;
    pendingBeats: number;
    totalPlays: number;
  };
  period: {
    revenue: number;
    sales: number;
  };
  recentSales: Array<{
    id: string;
    amount: number;
    sellerEarnings: number;
    createdAt: string;
    beat: { id: string; title: string; coverImage: string | null };
    buyer: { id: string; displayName: string | null; artistName?: string; avatar: string | null };
    license: { id: string; name: string };
  }>;
  topBeats: Array<{
    id: string;
    title: string;
    slug: string;
    genre: string[];
    bpm: number;
    plays: number;
    sales: number;
  }>;
  salesByDay: Array<{ date: string; count: number; revenue: number }>;
}

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (user && user.role === "SELLER") {
      fetchStats();
    } else if (user && user.role !== "SELLER") {
      router.push("/account");
    }
  }, [user, period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/seller/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (error) {
      console.error("Error fetching seller stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  if (!user || user.role !== "SELLER") {
    return (
      <div className="relative min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  const maxRevenue = stats?.salesByDay?.reduce((m, d) => Math.max(m, Number(d.revenue)), 1) || 1;

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">Dashboard Vendeur</h1>
              <p className="text-slate-400 mt-2">Bonjour, {user.displayName || user.username} 👋</p>
            </div>
            <div className="flex gap-3">
              <Link href="/seller/beats" className="btn-primary px-6 py-3 rounded-full font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Beat
              </Link>
              <Link href="/seller/withdrawals" className="glass px-6 py-3 rounded-full font-semibold hover:bg-white/10 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Retirer
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Chargement des statistiques...</p>
            </div>
          ) : stats ? (
            <>
              {/* Stats KPI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-2xl p-6">
                  <DollarSign className="w-8 h-8 text-green-400 mb-3" />
                  <div className="text-2xl font-bold text-gradient">{formatCurrency(Number(stats.period.revenue))}</div>
                  <div className="text-sm text-slate-400">Revenus ({period === 'month' ? 'ce mois' : period === 'week' ? 'cette semaine' : 'cette année'})</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <ShoppingCart className="w-8 h-8 text-brand-gold mb-3" />
                  <div className="text-2xl font-bold text-gradient">{stats.period.sales}</div>
                  <div className="text-sm text-slate-400">Ventes ({period === 'month' ? 'ce mois' : period === 'week' ? 'cette semaine' : 'cette année'})</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <Eye className="w-8 h-8 text-blue-400 mb-3" />
                  <div className="text-2xl font-bold text-gradient">{stats.overview.totalPlays.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Écoutes totales</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <Music className="w-8 h-8 text-purple-400 mb-3" />
                  <div className="text-2xl font-bold text-gradient">{stats.overview.totalBeats}</div>
                  <div className="text-sm text-slate-400">Beats publiés</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 glass rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-display flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-brand-gold" /> Revenus par jour
                    </h2>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                    >
                      <option value="week">7 derniers jours</option>
                      <option value="month">Ce mois</option>
                      <option value="year">Cette année</option>
                    </select>
                  </div>
                  {stats.salesByDay.length > 0 ? (
                    <div className="flex items-end gap-2 h-48">
                      {stats.salesByDay.map((d) => (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${formatDate(d.date)}: ${formatCurrency(Number(d.revenue))}`}>
                          <span className="text-xs text-brand-gold font-bold hidden md:block">{formatCurrency(Number(d.revenue))}</span>
                          <div
                            className="w-full bg-gradient-to-t from-brand-gold/30 to-brand-gold rounded-t-lg hover:from-brand-gold/50 transition-all"
                            style={{ height: `${(Number(d.revenue) / maxRevenue) * 100}%`, minHeight: '4px' }}
                          />
                          <span className="text-xs text-slate-400">{formatDate(d.date)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <p className="text-slate-500">Pas encore de ventes sur cette période</p>
                    </div>
                  )}
                </div>

                {/* Quick Nav + Balance */}
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-xl font-bold font-display mb-6">Navigation rapide</h2>
                  <div className="space-y-3">
                    <Link href="/seller/beats/display" className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5">
                      <Music className="w-5 h-5 text-brand-gold" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Mes beats</div>
                        <div className="text-xs text-slate-400">{stats.overview.totalBeats} productions</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/seller/licenses" className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Licences</div>
                        <div className="text-xs text-slate-400">Configurer vos tarifs</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/seller/services/display" className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Services</div>
                        <div className="text-xs text-slate-400">Gérer vos propositions</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/seller/withdrawals" className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-white/5">
                      <CreditCard className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Retraits</div>
                        <div className="text-xs text-slate-400">Historique & demandes</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>
                  {/* Balance */}
                  <div className="glass rounded-xl p-4 mt-6 border border-brand-gold/20">
                    <div className="text-sm text-slate-400">Revenus totaux</div>
                    <div className="text-3xl font-bold text-gradient mt-1">{formatCurrency(Number(stats.overview.totalRevenue))}</div>
                    {stats.overview.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-brand-gold">
                        <Star className="w-4 h-4" /> {stats.overview.rating.toFixed(1)} / 5
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="glass rounded-3xl p-8 mt-8">
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-brand-gold" /> Ventes récentes
                </h2>
                {stats.recentSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-400 border-b border-white/10">
                          <th className="pb-3 font-semibold">Beat</th>
                          <th className="pb-3 font-semibold">Acheteur</th>
                          <th className="pb-3 font-semibold">Licence</th>
                          <th className="pb-3 font-semibold">Prix</th>
                          <th className="pb-3 font-semibold">Vos gains</th>
                          <th className="pb-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentSales.map((sale) => (
                          <tr key={sale.id} className="border-b border-white/5 text-sm">
                            <td className="py-4 font-semibold">{sale.beat.title}</td>
                            <td className="py-4 text-slate-400">{sale.buyer.displayName || sale.buyer.artistName || "Acheteur"}</td>
                            <td className="py-4">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sale.license.name.toLowerCase().includes("exclusive") ? "bg-purple-500/20 text-purple-400" :
                                sale.license.name.toLowerCase().includes("premium") ? "bg-brand-gold/20 text-brand-gold" :
                                  "bg-white/10 text-white"
                                }`}>
                                {sale.license.name}
                              </span>
                            </td>
                            <td className="py-4 text-brand-gold font-bold">{formatCurrency(Number(sale.amount))}</td>
                            <td className="py-4 text-green-400 font-bold">+{formatCurrency(Number(sale.sellerEarnings))}</td>
                            <td className="py-4 text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDate(sale.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Pas encore de ventes sur cette période</p>
                    <Link href="/seller/beats" className="text-brand-gold text-sm mt-2 inline-block hover:underline">
                      Uploadez votre premier beat →
                    </Link>
                  </div>
                )}
              </div>

              {/* Top Beats */}
              {stats.topBeats.length > 0 && (
                <div className="glass rounded-3xl p-8 mt-8">
                  <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-brand-gold" /> Top Beats
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.topBeats.map((beat, i) => (
                      <Link key={beat.id} href={`/product/${beat.slug}`} className="glass rounded-xl p-5 hover:bg-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-gold to-yellow-500 flex items-center justify-center text-brand-purple font-bold text-lg">
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-bold">{beat.title}</div>
                            <div className="text-xs text-slate-400">{Array.isArray(beat.genre) ? beat.genre[0] : beat.genre}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-400">Écoutes:</span> <span className="font-bold">{beat.plays.toLocaleString()}</span></div>
                          <div><span className="text-slate-400">Ventes:</span> <span className="font-bold">{beat.sales}</span></div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">Erreur de chargement des données</p>
              <button onClick={fetchStats} className="btn-primary px-6 py-3 rounded-full mt-4">Réessayer</button>
            </div>
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
