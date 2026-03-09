"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Loader2, ChevronLeft, Check, Music } from "lucide-react";

export default function BuyerSubscriptionsPage() {
    const { user, token, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    useEffect(() => {
        if (user && user.role !== "BUYER") {
            router.push("/");
        }
    }, [user, router]);

    if (!user || user.role !== "BUYER") {
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

    const handleUpgradeToPremium = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ plan: `PREMIUM_${billingCycle.toUpperCase()}` })
            });

            const data = await res.json();
            if (res.ok) {
                await refreshUser();
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(data.error || "Erreur lors de la souscription");
            }
        } catch (err) {
            setError("Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    const plan = user.subscription?.plan?.replace("_MONTHLY", "").replace("_YEARLY", "") || "FREEMIUM";

    return (
        <div className="relative min-h-screen bg-gradient-premium">
            <Navbar />

            <main className="pt-20">
                <div className="mx-auto max-w-5xl px-6 py-12">
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        Retour au tableau de bord
                    </Link>

                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">
                            Abonnement Artiste
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl text-center md:text-left mx-auto md:mx-0">
                            Choisissez la formule qui correspond le mieux à vos besoins et bénéficiez de réductions sur vos achats de licences.
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4 mt-8">
                            <span className={`text-sm font-semibold transition-colors ${billingCycle === "monthly" ? "text-white" : "text-slate-500"}`}>Mensuel</span>
                            <button
                                onClick={() => setBillingCycle(b => b === "monthly" ? "yearly" : "monthly")}
                                className="relative w-16 h-8 rounded-full bg-white/10 border border-white/20 p-1 transition-colors hover:bg-white/20"
                            >
                                <div className={`w-6 h-6 rounded-full bg-brand-gold transition-transform duration-300 ${billingCycle === "yearly" ? "translate-x-8" : "translate-x-0"}`} />
                            </button>
                            <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${billingCycle === "yearly" ? "text-white" : "text-slate-500"}`}>
                                Annuel <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] uppercase font-bold tracking-wider">-20%</span>
                            </span>
                        </div>
                    </div>

                    {/* Success / Error Messages */}
                    {saved && (
                        <div className="glass rounded-xl p-4 mb-6 border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-semibold flex items-center gap-2">
                            <Check className="w-5 h-5" /> Abonnement mis à jour avec succès !
                        </div>
                    )}

                    {error && (
                        <div className="glass rounded-xl p-4 mb-6 border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold">
                            ❌ {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* FREEMIUM */}
                        <div className={`glass rounded-3xl p-8 border relative overflow-hidden transition-all flex flex-col group hover:border-white/20 ${plan === "FREEMIUM" ? "border-white/30 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]" : "border-white/10"}`}>
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <Music className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-bold font-display text-white">Freemium</h3>
                                    </div>
                                    {plan === "FREEMIUM" && <span className="bg-white/10 text-white text-xs px-3 py-1 font-bold uppercase rounded-full tracking-wider">Actuel</span>}
                                </div>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-4xl font-black text-white">0€</span>
                                    <span className="text-slate-500">/ mois</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    Le plan standard sans engagement. Idéal pour explorer le catalogue.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 text-sm text-slate-300 flex-grow">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white shrink-0 opacity-50" />
                                    <span>Accès complet au catalogue</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white shrink-0 opacity-50" />
                                    <span>Messagerie avec les beatmakers</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-white shrink-0 opacity-50" />
                                    <span><strong className="text-white">10%</strong> de frais de plateforme sur les achats</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                {plan === "FREEMIUM" ? (
                                    <div className="w-full py-4 text-center rounded-xl bg-white/5 text-slate-400 font-bold border border-white/10">Plan Actuel</div>
                                ) : (
                                    <div className="w-full py-4 text-center rounded-xl bg-transparent text-slate-500 font-medium">Inclus par défaut</div>
                                )}
                            </div>
                        </div>

                        {/* PREMIUM */}
                        <div className={`glass rounded-3xl p-8 relative overflow-hidden transition-all transform flex flex-col md:-translate-y-4 ${plan === "PREMIUM" ? "border-brand-gold shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-brand-gold/5" : "border-brand-gold/30 hover:border-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]"}`}>
                            <div className="absolute top-0 right-0 bg-brand-gold text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-10">Recommandé</div>
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-transparent pointer-events-none" />

                            <div className="mb-8 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-brand-gold/20">
                                            <Crown className="w-6 h-6 text-slate-900" />
                                        </div>
                                        <h3 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-400">Premium</h3>
                                    </div>
                                    {(plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY" || plan === "PREMIUM") && <span className="bg-brand-gold/20 text-brand-gold text-xs px-3 py-1 font-bold uppercase rounded-full tracking-wider hidden sm:block">Actuel</span>}
                                </div>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-4xl font-black text-white">{billingCycle === "monthly" ? "11,99€" : "115€"}</span>
                                    <span className="text-slate-500">/ {billingCycle === "monthly" ? "mois" : "an"}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    Pour les artistes qui achètent régulièrement.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 text-sm text-slate-100 relative flex-grow">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Accès complet au catalogue</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Messagerie avec les beatmakers</span>
                                </div>
                                <div className="flex items-start gap-3 p-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span><strong className="text-brand-gold text-base">0% de frais</strong> sur tous vos achats de licences</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Badge "Premium" sur votre profil</span>
                                </div>
                            </div>

                            <div className="mt-auto relative">
                                {plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY" || plan === "PREMIUM" ? (
                                    <button className="w-full py-4 text-center rounded-xl bg-brand-gold/10 text-brand-gold font-bold border border-brand-gold/30 cursor-default">
                                        Gérer l'abonnement
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUpgradeToPremium}
                                        disabled={loading}
                                        className="w-full py-4 text-center rounded-xl bg-brand-gold text-brand-purple font-black hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Devenir Premium"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
