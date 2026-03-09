"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Download, Music, FileText, Search, Clock, CheckCircle, ExternalLink, Loader2, AlertCircle, X, Zap, Crown } from "lucide-react";

interface Purchase {
  id: string;
  amount: number;
  createdAt: string;
  beat: {
    id: string; title: string; slug: string;
    genre: string[]; bpm: number; key: string | null; coverImage: string | null;
    mp3FileUrl?: string | null;
    wavFileUrl?: string | null;
    trackoutFileUrl?: string | null;
    seller: { id: string; sellerProfile: { artistName: string } | null; displayName: string | null; username: string };
  };
  license: { id: string; name: string; type: string };
}

export default function DownloadsPage() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token"); // Corrected line
    fetch("/api/purchases", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setPurchases(d.purchases || []))
      .catch(() => { })
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
    const name = p.beat.seller?.sellerProfile?.artistName || p.beat.seller?.displayName || p.beat.seller?.username || "";
    const matchSearch = !search || p.beat.title.toLowerCase().includes(search.toLowerCase()) || name.toLowerCase().includes(search.toLowerCase());
    const matchLicense = licenseFilter === "all" || p.license.name.toLowerCase().includes(licenseFilter);
    return matchSearch && matchLicense;
  });

  const getFormat = (l: Purchase["license"]) => {
    if (l.type === "EXCLUSIVE") return "MP3 + WAV + Trackout";
    if (l.type === "PREMIUM") return "WAV + MP3";
    return "MP3";
  };

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
                const producerName = item.beat.seller?.sellerProfile?.artistName || item.beat.seller?.displayName || item.beat.seller?.username || "Producteur inconnu";
                const isExclusive = item.license.type === "EXCLUSIVE";
                const isPremium = item.license.type === "PREMIUM";

                const displayLicenseName = isExclusive ? "EXCLUSIVE" : isPremium ? "NON-EXCLUSIVE" : "BASIC";

                return (
                  <div key={item.id} className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    {/* Cover */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative bg-white/5 border border-white/10 group-hover:border-brand-gold/30 transition-colors flex items-center justify-center">
                      <Music className="w-8 h-8 text-white/20 absolute" />
                      {item.beat.coverImage && (
                        <img
                          src={(() => {
                            const raw = item.beat.coverImage;
                            if (!raw) return '';
                            if (raw.startsWith('http') || raw.startsWith('/')) return raw;
                            if (raw.startsWith('images/')) {
                              const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, "");
                              return `${base}/${raw}`;
                            }
                            return `/uploads/covers/${raw}`;
                          })()}
                          alt=""
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h3 className="text-xl font-bold text-white truncate group-hover:text-brand-gold transition-colors">{item.beat.title}</h3>
                        <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md self-start ${isExclusive ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : isPremium ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                          LICENCE {displayLicenseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <span className="font-medium text-slate-300">{producerName}</span>
                        <span>•</span>
                        <span>{item.beat.bpm} BPM</span>
                        {item.beat.key && (
                          <>
                            <span>•</span>
                            <span>{item.beat.key}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-slate-300">Format: <span className="font-bold text-white">{getFormat(item.license)}</span></span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          Acheté le {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-3 md:pl-6 md:border-l border-white/10 min-w-[200px]">
                      <a href={`/api/purchases/${item.id}/download?token=${token}`}
                        className="flex-1 btn-primary bg-brand-gold hover:bg-brand-gold/90 text-slate-900 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-gold/10">
                        <Download className="w-3 h-3" /> Télécharger
                      </a>

                      <div className="flex gap-2">
                        <Link href={`/product/${item.beat.slug}`} className="flex-1 glass bg-white/5 hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center transition-colors text-slate-300 hover:text-white border border-white/10" title="Voir le beat">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button className="flex-1 glass bg-white/5 hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center transition-colors text-slate-300 hover:text-white border border-white/10" title="Contrat de licence">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Nouveau bloc récapitulatif des licences */}
          <div className="glass rounded-3xl p-8 mt-12 border-t-4 border-t-brand-gold/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                <FileText className="w-7 h-7 text-brand-gold" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-display text-white">Rappel d'utilisation des licences</h3>
                <p className="text-sm text-slate-400 mt-1">Ce que vous pouvez faire avec vos téléchargements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Basic */}
              <div className="glass bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Music className="w-20 h-20 text-blue-400" /></div>
                <h4 className="font-bold text-xl text-blue-300 mb-5 flex items-center gap-2">Licence Basic</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-blue-400 mt-0 flex-shrink-0" /> Fichier : MP3 Haute Qualité</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-blue-400 mt-0 flex-shrink-0" /> Streams : Jusqu'à 5 000 écoutes</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-blue-400 mt-0 flex-shrink-0" /> Distribution : Jusqu'à 2 500 copies</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-blue-400 mt-0 flex-shrink-0" /> Usage : Commercial Limité (Non-monétisé sur YouTube)</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-blue-400 mt-0 flex-shrink-0" /> Crédit : Mention obligatoire</li>
                </ul>
              </div>

              {/* Premium */}
              <div className="glass bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 relative overflow-hidden group hover:border-brand-gold/50 transition-colors hover:shadow-[0_0_30px_rgba(254,204,51,0.15)]">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="w-20 h-20 text-brand-gold" /></div>
                <h4 className="font-bold text-xl text-brand-gold mb-5 flex items-center gap-2">Licence Non-Exclusive</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-brand-gold mt-0 flex-shrink-0" /> Fichiers : WAV + MP3</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-brand-gold mt-0 flex-shrink-0" /> Streams : Jusqu'à 250 000 écoutes</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-brand-gold mt-0 flex-shrink-0" /> Distribution : Jusqu'à 10 000 copies</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-brand-gold mt-0 flex-shrink-0" /> Usage : Commercial Étendu</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-brand-gold mt-0 flex-shrink-0" /> Monétisation : Autorisée</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-brand-gold mt-0 flex-shrink-0" /> Crédit : Mention obligatoire</li>
                </ul>
              </div>

              {/* Exclusive */}
              <div className="glass bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/50 transition-colors hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Crown className="w-20 h-20 text-violet-400" /></div>
                <h4 className="font-bold text-xl text-violet-300 mb-5 flex items-center gap-2">Licence Exclusive</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-violet-400 mt-0 flex-shrink-0" /> Fichiers : WAV + MP3 + Trackout</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-violet-400 mt-0 flex-shrink-0" /> Streams & Ventes : Illimités</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-violet-400 mt-0 flex-shrink-0" /> Usage : Commercial Illimité</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-violet-400 mt-0 flex-shrink-0" /> Exclusivité : Beat retiré de la vente</li>
                  <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-violet-400 mt-0 flex-shrink-0" /> Droits : Contrat de cession inclus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
