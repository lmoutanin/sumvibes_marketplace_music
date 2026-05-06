"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useForum } from "@/hooks/useForum";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { MessageSquare, Users, Briefcase, Star, ArrowRight, Music, Flame, Loader2, Plus } from "lucide-react";
import { ServiceCard, ServiceData } from "@/components/community/ServiceCard";

interface SellerProfile {
  totalSales: number;
  artistName: string | null;
  user: { id: string; displayName: string | null; username: string; avatar: string | null };
}

interface CommunityData {
  stats: { totalUsers: number; totalPosts: number; totalServices: number };
  topSellers: SellerProfile[];
  featuredServices: ServiceData[];
}

const RANK_STYLES = [
  "from-brand-gold to-yellow-500 text-black shadow-[0_0_15px_rgba(254,215,102,0.5)]",
  "from-slate-300 to-slate-400 text-black shadow-[0_0_15px_rgba(203,213,225,0.3)]",
  "from-amber-600 to-amber-500 text-black shadow-[0_0_15px_rgba(217,119,6,0.4)]",
];



export default function CommunityPage() {
  const { user } = useAuth();
  const { posts, loading } = useForum();
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community/stats")
      .then((r) => r.json())
      .then((d) => setCommunityData(d))
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  // Get hot posts (posts with most replies)
  const hotPosts = [...posts]
    .sort((a, b) => (b._count?.replies || 0) - (a._count?.replies || 0))
    .slice(0, 4);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-6">
        {/* Hub Header */}
        <section className="relative mx-auto max-w-7xl text-center mb-16 mt-8">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-none text-sm mb-6 border border-brand-gold/20 shadow-[0_0_15px_rgba(254,215,102,0.15)]">
              <Users className="w-4 h-4 text-brand-gold" />
              <span className="text-brand-gold font-bold tracking-wide uppercase">Hub Communautaire</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 leading-tight">
              <span className="text-gradient drop-shadow-lg">Connectez-vous</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light">
              Échangez avec les meilleurs créateurs, collaborez avec des professionnels et développez votre réseau.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/community/forum" className="btn-primary px-8 py-3.5 rounded-none font-bold text-lg flex items-center gap-2 shadow-[0_4px_14px_0_rgba(254,215,102,0.39)] hover:shadow-[0_6px_20px_rgba(254,215,102,0.23)]">
                <MessageSquare className="w-5 h-5" /> Accéder au Forum
              </Link>
              <Link href="/community/services" className="glass px-8 py-3.5 rounded-none font-bold text-lg hover:border-brand-gold/50 transition-colors flex items-center gap-2 shadow-lg">
                <Briefcase className="w-5 h-5" /> Explorer les Services
              </Link>
            </div>
        </section>

        {/* Sections */}
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Forum Preview */}
          <div className="lg:col-span-2 glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-brand-gold fill-brand-gold/20" /> Dernières Discussions
              </h2>
              <Link href="/community/forum" className="text-brand-gold text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:underline underline-offset-4">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-12 relative z-10">
                <Loader2 className="w-10 h-10 mx-auto mb-4 text-brand-gold animate-spin" />
                <p className="text-slate-400 font-medium">Chargement du forum...</p>
              </div>
            ) : hotPosts.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {hotPosts.map((post) => (
                  <Link key={post.id} href={`/community/forum/${post.id}`} className="flex items-center gap-4 glass bg-black/20 rounded-2xl p-4 hover:bg-white/10 hover:scale-[1.01] transition-all border border-white/5 group border-l-2 border-l-transparent hover:border-l-brand-gold">
                    <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold/20 transition-colors">
                      <Music className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[15px] truncate text-white">{post.title}</h4>
                        {(post._count?.replies || 0) > 20 && <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                      </div>
                      <div className="text-[13px] text-slate-400 font-light">
                        Par <span className="font-medium text-slate-300">{post.author.artistName || post.author.username}</span> in <span className="text-brand-gold/80 bg-brand-gold/10 px-2 py-0.5 rounded-none">{post.category}</span>
                      </div>
                    </div>
                    <div className="glass px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 flex flex-col items-center justify-center min-w-[3.5rem] bg-black/40">
                      <span className="text-white">{post._count?.replies || 0}</span>
                      <span className="text-[10px] text-slate-500 uppercase">Rép.</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 relative z-10">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-600 stroke-[1]" />
                <p className="text-slate-400 mb-6 font-light">Aucune discussion pour le moment sur le Hub.</p>
                {user && (
                  <button 
                    onClick={() => setShowNewPostModal(true)}
                    className="btn-primary px-6 py-2.5 rounded-none font-semibold text-sm inline-flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" /> Démarrer un sujet
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Top Members */}
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-purple/20 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-2xl font-bold font-display flex items-center gap-3 mb-8 relative z-10">
              <Star className="w-7 h-7 text-brand-gold fill-brand-gold/20" /> Top Membres
            </h2>
            <div className="space-y-5 relative z-10">
              {dataLoading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" /></div>
              ) : communityData?.topSellers.length ? (
                communityData.topSellers.map((seller, i) => {
                  const name = seller.artistName || seller.user.displayName || seller.user.username;
                  return (
                    <Link key={seller.user.id} href={`/producers/${seller.user.id}`} className="glass bg-black/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${RANK_STYLES[i]} flex flex-col items-center justify-center font-black text-lg flex-shrink-0`}>
                        #{i + 1}
                      </div>
                      <Avatar src={seller.user.avatar} name={name} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-[15px] truncate">{name}</div>
                        <div className="text-[11px] font-bold tracking-wider text-brand-gold uppercase">{seller.totalSales} vente{seller.totalSales !== 1 ? "s" : ""}</div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">Aucun vendeur pour le moment.</p>
              )}
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="mx-auto max-w-7xl mb-20">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-3xl font-bold font-display flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-brand-gold fill-brand-gold/20" /> Services à la une
            </h2>
            <Link href="/community/services" className="glass px-5 py-2 rounded-none font-bold text-sm hover:border-brand-gold/50 transition-colors flex items-center gap-2">
              Tous les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-3xl p-8 animate-pulse h-64" />
              ))
            ) : communityData?.featuredServices.length ? (
              communityData.featuredServices.map((s) => (
                <ServiceCard key={s.id} service={s} featured={s.featured} />
              ))
            ) : (
              <div className="md:col-span-3 text-center py-12 text-slate-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />Aucun service disponible pour le moment.
              </div>
            )}
          </div>
        </section>

        {/* Messages CTA */}
        <section className="mx-auto max-w-7xl">
          <div className="glass rounded-3xl p-12 lg:p-16 text-center bg-gradient-to-r from-[#041245] to-[#021145] relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-gold/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-purple/30 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full glass bg-black/40 flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/20">
                 <MessageSquare className="w-10 h-10 text-brand-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Messagerie Privée</h2>
              <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                Négociez vos contrats, échangez vos maquettes et créez les hits de demain directement via notre messagerie intégrée.
              </p>
              <Link href="/community/messages" className="btn-primary px-10 py-4 rounded-none font-bold text-lg inline-flex items-center gap-3 shadow-[0_4px_20px_0_rgba(254,215,102,0.4)] hover:shadow-[0_6px_30px_rgba(254,215,102,0.3)] hover:scale-105 transition-all">
                <MessageSquare className="w-6 h-6" /> Ouvrir la messagerie
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}