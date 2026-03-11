"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, Download, FileText, Music, ArrowRight, Mail, Loader2, FileCheck } from "lucide-react";

interface Purchase {
  id: string;
  amount: number;
  platformFee: number;
  taxAmount: number;
  invoiceNumber: string;
  beat: { title: string; coverImage: string; seller: { sellerProfile: { artistName: string } | null } };
  license: { name: string; type: string };
}

export default function CheckoutConfirmationPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingContract, setDownloadingContract] = useState<string | null>(null);

  const downloadMergedDocument = async (purchaseId: string, invoiceNumber: string) => {
    try {
      setDownloadingContract(purchaseId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/purchase-document", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ purchaseId }),
      });

      if (!res.ok) throw new Error("Erreur lors du téléchargement du document");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Facture-et-Contrat-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Erreur:", err);
      alert("Erreur lors du téléchargement du document");
    } finally {
      setDownloadingContract(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/purchases?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        // Récupère les achats du dernier numéro de facture
        const all: Purchase[] = data.purchases ?? [];
        if (all.length === 0) return;
        const lastInvoice = all[0].invoiceNumber;
        setPurchases(all.filter((p) => p.invoiceNumber === lastInvoice));
      })
      .finally(() => setLoading(false));
  }, []);

  const invoiceNumber = purchases[0]?.invoiceNumber ?? "—";
  const total = purchases.reduce((sum, p) => sum + Number(p.amount), 0);
  const commission = purchases.reduce((sum, p) => sum + Number(p.platformFee || 0), 0);
  const tax = purchases.reduce((sum, p) => sum + Number(p.taxAmount || 0), 0);
  const subtotal = Number((total - commission - tax).toFixed(2));

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="w-14 h-14 text-green-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Paiement <span className="text-gradient">Confirmé</span> ! 🎉
            </h1>
            <p className="text-xl text-slate-300">
              Merci pour votre achat ! Vos fichiers sont prêts à être téléchargés.
            </p>
          </div>

          {/* Order Info */}
          <div className="glass rounded-3xl p-8 mb-8 text-left">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-slate-400">Commande</div>
                <div className="font-bold text-lg font-mono">{invoiceNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Total payé</div>
                <div className="text-2xl font-bold text-gradient">{total.toFixed(2)} €</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              {!loading && purchases.length > 0 && (
                <div className="glass rounded-2xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300"><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-slate-300"><span>Commission</span><span>{commission.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-slate-300"><span>TVA (20%)</span><span>{tax.toFixed(2)} €</span></div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white"><span>Total TTC</span><span>{total.toFixed(2)} €</span></div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                </div>
              ) : purchases.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Aucun achat trouvé.</p>
              ) : (
                purchases.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 glass rounded-2xl p-4">
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{item.beat.title}</div>
                      <div className="text-sm text-slate-400">
                        Prod. by {item.beat.seller.sellerProfile?.artistName || "Inconnu"} — Licence {item.license.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-col sm:flex-row">
                      <Link href="/account/downloads" className="glass rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-gold/20 hover:text-brand-gold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Fichiers
                      </Link>
                      <button
                        onClick={() => downloadMergedDocument(item.id, item.invoiceNumber)}
                        disabled={downloadingContract === item.id}
                        className="glass rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-gold/20 hover:text-brand-gold flex items-center gap-2 disabled:opacity-50"
                      >
                        {downloadingContract === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileCheck className="w-4 h-4" />
                        )}
                        Document
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <Link href="/account/downloads" className="glass rounded-2xl p-6 hover:scale-105 flex flex-col items-center gap-3 group">
              <Download className="w-8 h-8 text-brand-gold group-hover:scale-110" />
              <span className="font-bold">Fichiers</span>
              <span className="text-xs text-slate-400">Beats + Stems</span>
            </Link>
            <button
              onClick={() => {
                if (purchases.length > 0) {
                  downloadMergedDocument(purchases[0].id, purchases[0].invoiceNumber);
                }
              }}
              disabled={purchases.length === 0 || downloadingContract !== null}
              className="glass rounded-2xl p-6 hover:scale-105 flex flex-col items-center gap-3 group disabled:opacity-50 disabled:hover:scale-100"
            >
              {downloadingContract ? (
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
              ) : (
                <FileText className="w-8 h-8 text-brand-gold group-hover:scale-110" />
              )}
              <span className="font-bold">Document</span>
              <span className="text-xs text-slate-400">Facture + Contrat</span>
            </button>
            <div className="glass rounded-2xl p-6 flex flex-col items-center gap-3">
              <Mail className="w-8 h-8 text-brand-gold" />
              <span className="font-bold">Email</span>
              <span className="text-xs text-slate-400">Confirmé</span>
            </div>
          </div>

          {/* Info Notice */}
          <div className="glass rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold mb-3">📋 Important :</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Vos fichiers sont disponibles à tout moment dans votre espace &quot;Téléchargements&quot;.</li>
              <li>• La licence d&apos;utilisation au format PDF accompagne chaque fichier.</li>
              <li>• Un email récapitulatif vous a été envoyé avec tous les détails.</li>
              <li>• Pour toute question, contactez notre support.</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/account/downloads" className="btn-primary rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark px-8 py-4 font-bold text-black hover:scale-105 flex items-center gap-3">
              Mes téléchargements
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/catalogue" className="glass rounded-full px-8 py-4 font-bold hover:bg-white/10 flex items-center gap-3">
              <Music className="w-5 h-5" />
              Continuer l&apos;exploration
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}
