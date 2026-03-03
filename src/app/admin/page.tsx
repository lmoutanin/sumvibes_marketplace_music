"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield, Users, Music, DollarSign, Flag, BarChart3, TrendingUp, ArrowUp,
  ArrowDown, Eye, Ban, CheckCircle, AlertTriangle, Search, Filter, Settings,
  FileText, Clock, Star, ShoppingCart, Loader2, AlertCircle
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "beats", label: "Beats", icon: Music },
  { id: "finance", label: "Finance", icon: DollarSign },
];

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminStats, setAdminStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingBeats, setPendingBeats] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("all");
  const [moderating, setModerating] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, beatsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/beats?status=PENDING&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setAdminStats((await statsRes.json()));
      if (beatsRes.ok) setPendingBeats((await beatsRes.json()).beats || []);
    } finally { setLoading(false); }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams({ limit: "20" });
    if (userSearch) params.set("search", userSearch);
    if (userRole !== "all") params.set("role", userRole);
    const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsers((await res.json()).users || []);
  }, [token, userSearch, userRole]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === "users") fetchUsers(); }, [activeTab, fetchUsers]);

  const moderate = async (beatId: string, status: "PUBLISHED" | "REJECTED") => {
    setModerating(beatId);
    await fetch(`/api/admin/beats/${beatId}/moderate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setPendingBeats(prev => prev.filter(b => b.id !== beatId));
    setModerating(null);
  };

  if (!user || user.role !== "ADMIN") return (
    <div className="relative min-h-screen bg-gradient-premium"><Navbar />
      <main className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
          <p className="text-slate-400">Cette page est réservée aux administrateurs.</p>
          <Link href="/" className="btn-primary px-6 py-3 rounded-full mt-4 inline-block">Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  );

  const overview = adminStats?.overview;
  const period = adminStats?.period;

  return (
    <div className="relative min-h-screen bg-gradient-premium"><Navbar />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display text-gradient">Administration</h1>
              <p className="text-slate-400 text-sm">Back-office SUMVIBES</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 ${activeTab === tab.id ? "bg-brand-gold text-brand-purple" : "glass hover:bg-white/10"}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto" /></div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Utilisateurs", value: overview?.totalUsers?.toLocaleString() ?? "—", icon: Users, color: "text-blue-400" },
                      { label: "Beats publiés", value: overview?.totalBeats?.toLocaleString() ?? "—", icon: Music, color: "text-brand-gold" },
                      { label: "Revenus plateforme", value: overview?.totalRevenue ? `${Number(overview.totalRevenue).toFixed(0)}€` : "—", icon: DollarSign, color: "text-green-400" },
                      { label: "Beats en attente", value: pendingBeats.length.toString(), icon: Clock, color: "text-yellow-400" },
                    ].map(s => (
                      <div key={s.label} className="glass rounded-2xl p-6">
                        <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
                        <div className="text-2xl font-bold text-gradient">{s.value}</div>
                        <div className="text-sm text-slate-400">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-bold font-display mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" /> Beats en attente ({pendingBeats.length})
                      </h3>
                      {pendingBeats.length === 0 ? (
                        <p className="text-slate-500 text-sm">Aucun beat en attente de modération</p>
                      ) : (
                        <div className="space-y-3">
                          {pendingBeats.map(beat => (
                            <div key={beat.id} className="glass rounded-xl p-3 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">{beat.title}</div>
                                <div className="text-xs text-slate-400">
                                  {beat.seller?.sellerProfile?.artistName || beat.seller?.displayName || "—"} · {beat.genre?.[0]}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => moderate(beat.id, "PUBLISHED")} disabled={moderating === beat.id}
                                  className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-50">
                                  {moderating === beat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button onClick={() => moderate(beat.id, "REJECTED")} disabled={moderating === beat.id}
                                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50">
                                  <Ban className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-bold font-display mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" /> Stats du mois
                      </h3>
                      {period ? (
                        <div className="space-y-4">
                          {[
                            { label: "Revenus", val: `${Number(period.revenue ?? 0).toFixed(2)} €`, color: "text-green-400" },
                            { label: "Ventes", val: period.sales ?? 0, color: "text-brand-gold" },
                            { label: "Nouveaux utilisateurs", val: period.newUsers ?? 0, color: "text-blue-400" },
                            { label: "Nouveaux beats", val: period.newBeats ?? 0, color: "text-purple-400" },
                          ].map(item => (
                            <div key={item.label} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                              <span className="text-sm text-slate-400">{item.label}</span>
                              <span className={`font-bold ${item.color}`}>{item.val}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-slate-500 text-sm">Données non disponibles</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div>
                  <div className="glass rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" placeholder="Rechercher un utilisateur..." value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchUsers()}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50" />
                    </div>
                    <select value={userRole} onChange={e => setUserRole(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                      <option value="all">Tous les rôles</option>
                      <option value="BUYER">Acheteurs</option>
                      <option value="SELLER">Vendeurs</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                    <button onClick={fetchUsers} className="glass px-4 py-3 rounded-xl hover:bg-white/10 flex items-center gap-2">
                      <Filter className="w-5 h-5" /> Filtrer
                    </button>
                  </div>
                  <div className="glass rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-400 border-b border-white/10">
                          <th className="p-4 font-semibold">Utilisateur</th>
                          <th className="p-4 font-semibold">Rôle</th>
                          <th className="p-4 font-semibold">Inscrit</th>
                          <th className="p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-500">Aucun utilisateur trouvé</td></tr>
                        ) : users.map(u => (
                          <tr key={u.id} className="border-b border-white/5 text-sm hover:bg-white/5">
                            <td className="p-4">
                              <div className="font-semibold">{u.displayName || u.username}</div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === "SELLER" ? "bg-brand-gold/20 text-brand-gold" : u.role === "ADMIN" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                                {u.role === "SELLER" ? "Vendeur" : u.role === "ADMIN" ? "Admin" : "Acheteur"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <button className="glass p-1.5 rounded-lg hover:bg-white/10" title="Voir"><Eye className="w-4 h-4" /></button>
                                <button className="glass p-1.5 rounded-lg hover:bg-white/10" title="Modifier"><Settings className="w-4 h-4" /></button>
                                <button className="glass p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="Bannir"><Ban className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "beats" && (
                <div>
                  <h2 className="text-xl font-bold font-display mb-4">Beats en attente de modération</h2>
                  {pendingBeats.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <p className="text-slate-400">Aucun beat en attente de validation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBeats.map(beat => (
                        <div key={beat.id} className="glass rounded-2xl p-5 flex items-center gap-5">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-purple/20 to-brand-pink/20">
                            {beat.coverImage ? <img src={beat.coverImage} alt={beat.title} className="w-full h-full object-cover" /> : <Music className="w-7 h-7 text-white/30 m-auto mt-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold">{beat.title}</div>
                            <div className="text-sm text-slate-400">
                              {beat.seller?.sellerProfile?.artistName || beat.seller?.displayName || "—"} · {beat.genre?.[0]} · {beat.bpm} BPM
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{new Date(beat.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                          </div>
                          {beat.previewUrl && (
                            <audio controls src={beat.previewUrl} className="hidden md:block w-48" />
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => moderate(beat.id, "PUBLISHED")} disabled={moderating === beat.id}
                              className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
                              {moderating === beat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approuver
                            </button>
                            <button onClick={() => moderate(beat.id, "REJECTED")} disabled={moderating === beat.id}
                              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
                              <Ban className="w-4 h-4" /> Rejeter
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "finance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Revenus totaux", val: overview?.totalRevenue ? `${Number(overview.totalRevenue).toFixed(2)} €` : "—", icon: DollarSign, color: "text-green-400" },
                      { label: "Ventes totales", val: overview?.totalSales?.toLocaleString() ?? "—", icon: ShoppingCart, color: "text-brand-gold" },
                      { label: "Commission (15%)", val: overview?.totalRevenue ? `${(Number(overview.totalRevenue) * 0.15).toFixed(2)} €` : "—", icon: TrendingUp, color: "text-purple-400" },
                    ].map(s => (
                      <div key={s.label} className="glass rounded-2xl p-6">
                        <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
                        <div className="text-2xl font-bold">{s.val}</div>
                        <div className="text-sm text-slate-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="glass rounded-2xl p-8 text-center">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">L'historique complet des transactions sera disponible prochainement.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">© 2026 SUMVIBES by SAS BE GREAT.</div>
      </footer>
    </div>
  );
}
