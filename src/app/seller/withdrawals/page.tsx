"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Banknote, Info, DollarSign, TrendingUp } from "lucide-react";

const withdrawals = [
  { id: 1, amount: 250.00, method: "Virement bancaire", status: "completed", date: "25 Jan 2026", processedDate: "28 Jan 2026", reference: "WD-2026-001" },
  { id: 2, amount: 180.00, method: "PayPal", status: "processing", date: "20 Jan 2026", processedDate: null, reference: "WD-2026-002" },
  { id: 3, amount: 500.00, method: "Virement bancaire", status: "completed", date: "15 Déc 2025", processedDate: "18 Déc 2025", reference: "WD-2025-012" },
  { id: 4, amount: 150.00, method: "PayPal", status: "completed", date: "1 Déc 2025", processedDate: "3 Déc 2025", reference: "WD-2025-011" },
  { id: 5, amount: 300.00, method: "Virement bancaire", status: "rejected", date: "15 Nov 2025", processedDate: null, reference: "WD-2025-010" },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: "Effectué", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  processing: { label: "En cours", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  rejected: { label: "Rejeté", color: "bg-red-500/20 text-red-400", icon: XCircle },
  pending: { label: "En attente", color: "bg-blue-500/20 text-blue-400", icon: AlertCircle },
};

export default function SellerWithdrawalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");

  const balance = 892.47;
  const totalWithdrawn = withdrawals.filter((w) => w.status === "completed").reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6">
            <ChevronLeft className="w-5 h-5" /> Retour au dashboard
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-8">Retraits</h1>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-2xl p-6 border border-brand-gold/20">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-8 h-8 text-brand-gold" />
                <span className="text-sm text-slate-400">Solde disponible</span>
              </div>
              <div className="text-3xl font-bold text-gradient">{balance.toFixed(2)}€</div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-sm text-slate-400">Total retiré</span>
              </div>
              <div className="text-3xl font-bold">{totalWithdrawn.toFixed(2)}€</div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-sm text-slate-400">En cours</span>
              </div>
              <div className="text-3xl font-bold">
                {withdrawals.filter((w) => w.status === "processing").reduce((sum, w) => sum + w.amount, 0).toFixed(2)}€
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn-primary px-8 py-3 rounded-full font-semibold flex items-center gap-2 mb-8">
              <Banknote className="w-5 h-5" /> Demander un retrait
            </button>
          ) : (
            <div className="glass rounded-3xl p-8 mb-8">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <Banknote className="w-6 h-6 text-brand-gold" /> Nouveau retrait
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Montant</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      min="50"
                      max={balance}
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-bold placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Minimum 50€ · Maximum {balance.toFixed(2)}€</p>
                  <button onClick={() => setAmount(balance.toString())} className="text-brand-gold text-xs mt-1 hover:underline">
                    Tout retirer
                  </button>
                </div>

                {/* Method */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Méthode de retrait</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setMethod("bank")}
                      className={`w-full flex items-center gap-3 glass rounded-xl p-4 ${method === "bank" ? "ring-2 ring-brand-gold" : "hover:bg-white/5"}`}
                    >
                      <CreditCard className="w-5 h-5 text-brand-gold" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm">Virement bancaire</div>
                        <div className="text-xs text-slate-400">3-5 jours ouvrés</div>
                      </div>
                      {method === "bank" && <CheckCircle className="w-5 h-5 text-brand-gold" />}
                    </button>
                    <button
                      onClick={() => setMethod("paypal")}
                      className={`w-full flex items-center gap-3 glass rounded-xl p-4 ${method === "paypal" ? "ring-2 ring-brand-gold" : "hover:bg-white/5"}`}
                    >
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm">PayPal</div>
                        <div className="text-xs text-slate-400">1-2 jours ouvrés</div>
                      </div>
                      {method === "paypal" && <CheckCircle className="w-5 h-5 text-brand-gold" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="glass rounded-xl p-4 mt-6 border border-brand-gold/20 bg-brand-gold/5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">
                    Les retraits sont traités sous 1 à 5 jours ouvrés. Assurez-vous que vos informations bancaires sont correctement renseignées dans vos paramètres.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="btn-primary px-8 py-3 rounded-full font-semibold flex items-center gap-2">
                  <Banknote className="w-5 h-5" /> Confirmer le retrait
                </button>
                <button onClick={() => setShowForm(false)} className="glass px-6 py-3 rounded-full font-semibold hover:bg-white/10">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <div className="glass rounded-3xl p-8">
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-gold" /> Historique des retraits
            </h2>
            {withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-400 border-b border-white/10">
                      <th className="pb-3 font-semibold">Référence</th>
                      <th className="pb-3 font-semibold">Montant</th>
                      <th className="pb-3 font-semibold">Méthode</th>
                      <th className="pb-3 font-semibold">Statut</th>
                      <th className="pb-3 font-semibold">Date demande</th>
                      <th className="pb-3 font-semibold">Date traitement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => {
                      const status = statusConfig[w.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={w.id} className="border-b border-white/5 text-sm">
                          <td className="py-4 font-mono text-xs text-slate-400">{w.reference}</td>
                          <td className="py-4 font-bold text-brand-gold">{w.amount.toFixed(2)}€</td>
                          <td className="py-4 text-slate-300">{w.method}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${status.color}`}>
                              <StatusIcon className="w-3 h-3" /> {status.label}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400">{w.date}</td>
                          <td className="py-4 text-slate-400">{w.processedDate || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💰</div>
                <p className="text-slate-400">Aucun retrait effectué pour le moment.</p>
              </div>
            )}
          </div>
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
