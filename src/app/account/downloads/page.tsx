"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Download, Music, FileText, Search, Clock, CheckCircle, ExternalLink, Loader2, AlertCircle } from "lucide-react";

interface Purchase {
  id: string;
  amount: number;
  createdAt: string;
  beat: {
    id: string; title: string; slug: string;
    genre: string[]; bpm: number; key: string | null; coverImage: string | null;
    seller: { sellerProfile: { artistName: string } | null; displayName: string | null; username: string };
  };
  license: { id: string; name: string; includesWav: boolean; includesStems: boolean; includesMp3: boolean };
}

export default function DownloadsPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch("/api/purchases", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setPurchases(d.purchases || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="relative min-h-screen bg-gradient-premium"><Navbar />
      <main className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Connectez-vous pour voir vos téléchargements</p>
          <Link href="/login" className="btn-primary px-6 py-3 rounded-full">Se connecter</Link>
        </div>
      </main>
    </div>
  );

  const filtered = purchases.filter(p => {
    const name = p.beat.seller.sellerProfile?.artistName || p.beat.seller.displayName || p.beat.seller.username;
    const matchSearch = !search || p.beat.title.toLowerCase().includes(search.toLowerCase()) || name.toLowerCase().includes(search.toLowerCase());
    const matchLicense = licenseFilter === "all" || p.license.name.toLowerCase().includes(licenseFilter);
    return matchSearch && matchLicense;
  });

  const getFormat = (l: Purchase["license"]) => [l.includesMp3 && "MP3", l.includesWav && "WAV", l.includesStems && "Stems"].filter(Boolean).join(" + ") || "MP3";

  return (
    <div className="relative min-h-screen bg-gradient-premium"><Navbar />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/account" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6"><ChevronLeft className="w-5 h-5" /> Retour au compte</Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">Mes Téléchargements</h1>
              <p className="text-slate-400 mt-2">Retrouvez tous vos achats et fichiers</p>
            </div>
            <span className="glass px-4 py-2 rounded-full text-sm">{purchases.length} achat{purchases.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="glass rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50" />
            </div>
            <select value={licenseFilter} onChange={e => setLicenseFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
              <option value="all">Toutes les licences</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-4" /><p className="text-slate-400">Chargement...</p></div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Download className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              {purchases.length === 0
                ? <><p className="text-slate-400 mb-4">Aucun achat pour l'instant</p><Link href="/catalogue" className="btn-primary px-6 py-3 rounded-full">Découvrir les beats</Link></>
                : <p className="text-slate-400">Aucun résultat</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(item => {
                const producerName = item.beat.seller.sellerProfile?.artistName || item.beat.seller.displayName || item.beat.seller.username;
                const isExclusive = item.license.name.toLowerCase().includes("exclusive");
                const isPremium = item.license.name.toLowerCase().includes("premium");
                return (
                  <div key={item.id} className="glass rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                          {item.beat.coverImage
                            ? <img src={item.beat.coverImage} alt={item.beat.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-brand-gold/10 flex items-center justify-center"><Music className="w-7 h-7 text-brand-gold" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg">{item.beat.title}</h3>
                          <p className="text-sm text-slate-400">{producerName} · {item.beat.genre[0]} · {item.beat.bpm} BPM{item.beat.key ? ` · ${item.beat.key}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isExclusive ? "bg-purple-500/20 text-purple-400" : isPremium ? "bg-brand-gold/20 text-brand-gold" : "bg-white/10 text-white"}`}>{item.license.name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="text-sm text-right">
                        <div className="text-slate-300">{getFormat(item.license)}</div>
                        <div className="text-xs text-slate-400">{Number(item.amount).toFixed(2)} €</div>
                        {isExclusive && <div className="text-xs text-green-400 flex items-center gap-1 justify-end mt-1"><CheckCircle className="w-3 h-3" />Illimité</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`/api/purchases/${item.id}/download`} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                          <Download className="w-4 h-4" /> Télécharger
                        </a>
                        <Link href={`/product/${item.beat.slug}`} className="glass p-2 rounded-xl hover:bg-white/10" title="Voir le produit"><ExternalLink className="w-4 h-4" /></Link>
                        <button className="glass p-2 rounded-xl hover:bg-white/10" title="Voir la licence"><FileText className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="glass rounded-3xl p-8 mt-10">
            <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-brand-gold" />Rappel des licences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Basic", color: "", items: ["Format MP3", "Usage non-commercial", "Crédit obligatoire"] },
                { name: "Premium", color: "border border-brand-gold/20", items: ["WAV + MP3", "Usage commercial", "Distribution limitée"] },
                { name: "Exclusive", color: "border border-purple-400/20", items: ["WAV + Stems", "Droits complets", "Beat retiré du catalogue"] },
              ].map(l => (
                <div key={l.name} className={`glass rounded-xl p-4 ${l.color}`}>
                  <h4 className="font-bold text-sm mb-2">{l.name}</h4>
                  <ul className="text-xs text-slate-400 space-y-1">{l.items.map(i => <li key={i}>• {i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">© 2026 SUMVIBES by SAS BE GREAT.</div>
      </footer>
    </div>
  );
}
