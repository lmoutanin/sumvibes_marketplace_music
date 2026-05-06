"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Check, Crown, Zap, Music, Upload, BadgePercent, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellerSubscriptionsPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const plan = user?.subscription?.plan || "FREEMIUM";

    const handleSubscribe = async (selectedPlan: "STANDARD" | "PREMIUM") => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Vous devez être connecté.");
            }

            // Simulation : Appel direct de l'API pour changer le plan
            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan: `${selectedPlan}_${billingCycle.toUpperCase()}`
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur lors du changement d'abonnement");
            }

            await refreshUser();
            alert(`Félicitations ! Vous êtes maintenant ${selectedPlan}.`);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-premium">
            <Navbar />
            <main className="pt-28 pb-16">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
                            Passez à la vitesse <span className="text-brand-gold">supérieure</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Choisissez le plan qui correspond à vos ambitions et gardez jusqu&apos;à 100% de vos revenus de vente.
                        </p>

                        <div className="flex items-center justify-center gap-4 mt-8">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* FREEMIUM */}
                        <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <Music className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-display text-white">Freemium</h3>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">0€</span>
                                    <span className="text-slate-500">/ mois</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    Idéal pour démarrer et tester la plateforme sans engagement.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 text-sm text-slate-300 flex-grow">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>Jusqu'à <strong className="text-white">3 uploads</strong> par mois</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>Fichiers <strong className="text-white">MP3 uniquement</strong></span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                                    <span><strong className="text-white">30%</strong> de commission plateforme sur les ventes</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                                    <span><strong className="text-white">15%</strong> de commission sur vos achats</span>
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

                        {/* STANDARD */}
                        <div className={`glass rounded-3xl p-8 relative overflow-hidden transition-all flex flex-col ${plan === "STANDARD_MONTHLY" || plan === "STANDARD_YEARLY" ? "border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.15)] bg-blue-500/5" : "border-white/10 hover:border-blue-500/50"}`}>
                            {(plan === "STANDARD_MONTHLY" || plan === "STANDARD_YEARLY") && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                            )}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold font-display text-white">Standard</h3>
                                    </div>
                                    {(plan === "STANDARD_MONTHLY" || plan === "STANDARD_YEARLY") && <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 font-bold uppercase rounded-full tracking-wider">Actuel</span>}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">{billingCycle === "monthly" ? "9,99€" : "95€"}</span>
                                    <span className="text-slate-500">/ {billingCycle === "monthly" ? "mois" : "an"}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    Pour les beatmakers réguliers qui veulent distribuer en haute qualité.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 text-sm text-slate-300 flex-grow">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Uploads <strong className="text-white">illimités</strong></span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Fichiers <strong className="text-white">MP3 + WAV</strong> autorisés</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Commission de vente réduite à <strong className="text-white">20%</strong></span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Frais réduits à <strong className="text-white">5%</strong> sur vos achats</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span>Licences Non-Exclusives uniquement et Contrats PDF automatiques</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                {plan === "STANDARD_MONTHLY" || plan === "STANDARD_YEARLY" ? (
                                    <button className="w-full py-4 text-center rounded-xl bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 cursor-default">
                                        Gérer l'abonnement
                                    </button>
                                ) : (
                                    <button onClick={() => handleSubscribe("STANDARD")} className="w-full py-4 text-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Choisir Standard"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* PREMIUM */}
                        <div className={`glass rounded-3xl p-8 relative overflow-hidden transition-all transform flex flex-col md:-translate-y-4 ${plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY" ? "border-brand-gold shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-brand-gold/5" : "border-brand-gold/30 hover:border-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]"}`}>
                            <div className="absolute top-0 right-0 bg-brand-gold text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-10">Plus Populaire</div>
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-transparent pointer-events-none" />

                            <div className="mb-8 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-brand-gold/20">
                                            <Crown className="w-6 h-6 text-slate-900" />
                                        </div>
                                        <h3 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-400">Premium</h3>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">{billingCycle === "monthly" ? "14,99€" : "145€"}</span>
                                    <span className="text-slate-500">/ {billingCycle === "monthly" ? "mois" : "an"}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    L'expérience ultime pour maximiser vos revenus et propulser votre carrière.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 text-sm text-slate-100 relative flex-grow">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Uploads <strong className="text-brand-gold">illimités</strong> (MP3, WAV, Trackouts)</span>
                                </div>
                                <div className="flex items-start gap-3 p-2 rounded-lg bg-brand-gold/10 border border-brand-gold/20">
                                    <BadgePercent className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span><strong className="text-brand-gold text-base">0%</strong> de commission sur vos ventes. Gardez 100% de vos revenus.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span><strong className="text-brand-gold text-base">0%</strong> de commission sur vos achats</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Ventes Exclusives autorisées</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Mise en avant du profil (Badge Pro)</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-brand-gold shrink-0" />
                                    <span>Possibilité de proposer des <strong className="text-white">Services</strong> (Mixage, etc.)</span>
                                </div>
                            </div>

                            <div className="mt-auto relative">
                                {plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY" ? (
                                    <button className="w-full py-4 text-center rounded-xl bg-brand-gold/10 text-brand-gold font-bold border border-brand-gold/30 cursor-default">
                                        Plan Actuel
                                    </button>
                                ) : (
                                    <button onClick={() => handleSubscribe("PREMIUM")} className="w-full py-4 text-center rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold shadow-xl shadow-brand-gold/30 transition-all flex items-center justify-center gap-2 group">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : (
                                            <>
                                                Passer Premium <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
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
