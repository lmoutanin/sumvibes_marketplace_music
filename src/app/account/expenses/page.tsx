"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, CreditCard, Clock, Download, ShoppingBag, Loader2 } from "lucide-react";

interface Purchase {
    id: string;
    amount: number;
    createdAt: string;
    beat: {
        id: string;
        title: string;
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
}

export default function ExpensesPage() {
    const { user, token } = useAuth();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        if (!user) return;
        const jwt = localStorage.getItem("token");
        if (!jwt) return;

        fetch("/api/purchases", { headers: { Authorization: `Bearer ${jwt}` } })
            .then((res) => res.json())
            .then((data) => {
                if (data.purchases) {
                    setPurchases(data.purchases);
                    const total = data.purchases.reduce((sum: number, p: Purchase) => sum + Number(p.amount), 0);
                    setTotalSpent(total);
                }
            })
            .catch((err) => console.error("Error fetching purchases:", err))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return (
            <div className="relative min-h-screen bg-gradient-premium">
                <Navbar />
                <main className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
                        <Link href="/login" className="btn-primary px-8 py-3 rounded-none">
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

            <main className="pt-20 pb-24">
                <div className="mx-auto max-w-5xl px-6 py-12">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <Link href="/account" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors tooltip-trigger" title="Retour au compte">
                            <ChevronLeft className="w-5 h-5 text-slate-300" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold font-display text-white">Mes Dépenses</h1>
                            <p className="text-slate-400 text-sm mt-1">Historique complet de vos achats et factures</p>
                        </div>
                    </div>

                    {/* KPI Total */}
                    <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />
                        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 flex-shrink-0">
                                <CreditCard className="w-8 h-8 text-brand-gold" />
                            </div>
                            <div>
                                <div className="text-slate-400 font-medium">Investissement total</div>
                                <div className="text-4xl font-bold text-gradient mt-1">{totalSpent.toFixed(2)} €</div>
                            </div>
                        </div>
                        <div className="relative z-10 w-full md:w-auto text-left md:text-right">
                            <div className="text-slate-300">
                                <span className="font-bold text-white">{purchases.length}</span> licences acquises
                            </div>
                            <div className="text-sm text-slate-500 mt-1">Depuis la création du compte</div>
                        </div>
                    </div>

                    {/* Liste des achats */}
                    <div className="glass rounded-3xl p-8">
                        <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-brand-gold" /> Historique détaillé
                        </h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-4" />
                                <p className="text-slate-400">Chargement de votre historique...</p>
                            </div>
                        ) : purchases.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-slate-400 border-b border-white/10">
                                            <th className="pb-3 font-semibold min-w-[200px]">Beat</th>
                                            <th className="pb-3 font-semibold min-w-[150px]">Beatmaker</th>
                                            <th className="pb-3 font-semibold">Licence</th>
                                            <th className="pb-3 font-semibold text-right">Prix</th>
                                            <th className="pb-3 font-semibold text-right">Date</th>
                                            <th className="pb-3 font-semibold text-center min-w-[100px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchases.map((purchase) => {
                                            const isExclusive = purchase.license.type === "EXCLUSIVE";
                                            const isPremium = purchase.license.type === "PREMIUM";
                                            // Utilisation des nouveaux libellés
                                            const licenseName = isExclusive ? "EXCLUSIVE" : isPremium ? "NON-EXCLUSIVE" : "BASIC";

                                            return (
                                                <tr key={purchase.id} className="border-b border-white/5 text-sm hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 font-bold text-white">
                                                        {purchase.beat.title}
                                                    </td>
                                                    <td className="py-4 text-slate-400">
                                                        <Link href={`/producers/${purchase.beat.seller?.id}`} className="hover:text-brand-gold transition-colors">
                                                            {purchase.beat.seller?.displayName || purchase.beat.seller?.username}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${isExclusive ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : isPremium ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"}`}>
                                                            {licenseName}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-white font-bold text-right">{Number(purchase.amount).toFixed(2)} €</td>
                                                    <td className="py-4 text-slate-400 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 space-x-2 text-center">
                                                        <a href={`/api/purchases/${purchase.id}/download?token=${token}`} className="glass inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors" title="Télécharger les fichiers">
                                                            <Download className="w-4 h-4 text-slate-300" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Vous n'avez pas encore effectué d'achats.</p>
                                <Link href="/catalogue" className="text-brand-gold font-bold mt-4 inline-block hover:underline">
                                    Explorer le catalogue
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
