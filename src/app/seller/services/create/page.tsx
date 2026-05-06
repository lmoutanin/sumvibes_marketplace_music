"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Info, Loader2, Crown } from "lucide-react";

export default function CreateServicePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "mixage",
        price: "",
        deliveryTime: "",
        location: ""
    });

    useEffect(() => {
        if (user && user.role !== "SELLER" && user.role !== "ADMIN") {
            router.push("/account");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token");

            const res = await fetch("/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });

            if (res.ok) {
                router.push("/seller/services/display");
            } else {
                const data = await res.json();
                alert(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion serveur.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
        return (
            <div className="min-h-screen bg-gradient-premium flex items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            </div>
        );
    }

    if (user.role === "SELLER") {
        const plan = user.subscription?.plan;
        if (plan !== "PREMIUM_MONTHLY" && plan !== "PREMIUM_YEARLY") {
            return (
                <div className="min-h-screen bg-gradient-premium flex flex-col items-center justify-center text-center px-4">
                    <Navbar />
                    <div className="glass rounded-3xl p-10 max-w-lg border border-brand-gold/30 mt-20">
                        <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-6">
                            <Crown className="w-8 h-8 text-brand-gold" />
                        </div>
                        <h2 className="text-2xl font-bold font-display text-white mb-4">Abonnement Premium Requis</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            La création de services (Mixage, Mastering, etc.) est une fonctionnalité exclusive réservée aux producteurs Premium.
                            Passez à la vitesse supérieure pour débloquer cette option.
                        </p>
                        <Link href="/seller/subscriptions" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-900 shadow-lg shadow-brand-gold/20 font-bold hover:scale-105 transition-transform">
                            Découvrir les offres
                        </Link>
                        <Link href="/seller/dashboard" className="block mt-4 text-sm text-slate-500 hover:text-white transition-colors">
                            Retour au tableau de bord
                        </Link>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="relative min-h-screen bg-gradient-premium">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-6">
                <div className="mx-auto max-w-3xl">
                    <Link href="/seller/services/display" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8 transition-colors text-sm font-medium">
                        <ChevronLeft className="w-5 h-5" /> Retour à mes services
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-2 text-white">
                        Proposer un <span className="text-gradient">Service</span>
                    </h1>
                    <p className="text-slate-300 font-light mb-10">
                        Décrivez précisément ce que vous offrez pour attirer les bons clients.
                    </p>

                    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 md:p-10 border border-white/10 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Titre du service <span className="text-brand-gold">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-colors"
                                    placeholder="ex: Mixage & Mastering Professionnel"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Catégorie <span className="text-brand-gold">*</span></label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 transition-colors appearance-none"
                                    >
                                        <option value="mixage">Mixage & Mastering</option>
                                        <option value="ecriture">Écriture / Toplining</option>
                                        <option value="design">Design & Artwork</option>
                                        <option value="video">Vidéo & Clips</option>
                                        <option value="coaching">Coaching</option>
                                        <option value="promo">Promotion</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Prix de base (€) <span className="text-brand-gold">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Description détaillée <span className="text-brand-gold">*</span></label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-colors resize-y"
                                    placeholder="Décrivez votre processus, ce que le client recevra, le nombre de retouches incluses..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Délai de livraison de base</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryTime}
                                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-colors"
                                        placeholder="ex: 3-5 jours ouvrés"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Localisation (si présentiel)</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-colors"
                                        placeholder="ex: Paris, Studio X / En ligne"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                                <Info className="w-4 h-4 text-brand-gold" />
                                Tous les services sont soumis à validation par notre équipe.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto group relative inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-[length:200%_auto] hover:bg-[position:right_center] rounded-xl font-extrabold text-black overflow-hidden shadow-[0_4px_20px_rgba(254,215,102,0.4)] hover:shadow-[0_8px_30px_rgba(254,215,102,0.6)] hover:-translate-y-1 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(254,215,102,0.4)]"
                            >
                                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin text-black relative z-10" />
                                        <span className="relative z-10 drop-shadow-sm">Publication...</span>
                                    </>
                                ) : (
                                    <span className="relative z-10 drop-shadow-sm">Publier le service</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
