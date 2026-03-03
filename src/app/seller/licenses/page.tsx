"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, FileText, Edit, Save, Plus, Trash2, DollarSign, Info, CheckCircle } from "lucide-react";

const defaultLicenses = [
  {
    id: 1,
    name: "Basic",
    active: true,
    price: 29.99,
    format: "MP3",
    streams: "50 000",
    distribution: "2 plateformes",
    credits: "Crédit obligatoire",
    exclusive: false,
    description: "Idéale pour les artistes indépendants qui débutent. Usage non-commercial.",
    features: ["Fichier MP3 haute qualité", "3 téléchargements", "50 000 streams max", "Usage non-commercial", "Crédit producteur obligatoire"],
  },
  {
    id: 2,
    name: "Premium",
    active: true,
    price: 49.99,
    format: "WAV + MP3",
    streams: "500 000",
    distribution: "Toutes plateformes",
    credits: "Crédit recommandé",
    exclusive: false,
    description: "Pour les projets sérieux avec distribution commerciale.",
    features: ["Fichiers WAV + MP3", "5 téléchargements", "500 000 streams max", "Usage commercial autorisé", "Distribution sur toutes les plateformes", "Crédit producteur recommandé"],
  },
  {
    id: 3,
    name: "Exclusive",
    active: true,
    price: 199.99,
    format: "WAV + Stems + Projet",
    streams: "Illimité",
    distribution: "Toutes plateformes",
    credits: "Non obligatoire",
    exclusive: true,
    description: "Droits complets et exclusifs. Le beat est retiré du catalogue après achat.",
    features: ["WAV + Stems + Fichier projet", "Téléchargements illimités", "Streams illimités", "Droits complets transférés", "Beat retiré du catalogue", "Aucun crédit obligatoire"],
  },
];

export default function SellerLicensesPage() {
  const [licenses, setLicenses] = useState(defaultLicenses);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePriceChange = (id: number, newPrice: string) => {
    setLicenses((prev) =>
      prev.map((l) => (l.id === id ? { ...l, price: parseFloat(newPrice) || 0 } : l))
    );
  };

  const toggleActive = (id: number) => {
    setLicenses((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6">
            <ChevronLeft className="w-5 h-5" /> Retour au dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">Licences</h1>
              <p className="text-slate-400 mt-2">Configurez vos types de licences et tarifs</p>
            </div>
            <button className="glass px-6 py-3 rounded-full font-semibold hover:bg-white/10 flex items-center gap-2 self-start">
              <Plus className="w-5 h-5" /> Licence personnalisée
            </button>
          </div>

          {saved && (
            <div className="glass rounded-xl p-4 mb-6 border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Licences mises à jour avec succès !
            </div>
          )}

          {/* Info */}
          <div className="glass rounded-2xl p-6 mb-8 border border-brand-gold/20 bg-brand-gold/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-brand-gold mb-1">Commission SUMVIBES</h3>
                <p className="text-sm text-slate-300">
                  SUMVIBES prélève une commission de <span className="text-brand-gold font-bold">15%</span> sur chaque vente.
                  Le reste vous est intégralement reversé. Les retraits sont possibles à partir de 50€.
                </p>
              </div>
            </div>
          </div>

          {/* License Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {licenses.map((license) => (
              <div
                key={license.id}
                className={`glass rounded-3xl p-6 transition-all ${
                  !license.active ? "opacity-50" : ""
                } ${license.exclusive ? "border border-purple-400/30" : license.name === "Premium" ? "border border-brand-gold/30" : ""}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${
                    license.exclusive ? "text-purple-400" :
                    license.name === "Premium" ? "text-brand-gold" : ""
                  }`}>
                    {license.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={license.active} onChange={() => toggleActive(license.id)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold" />
                    </label>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {editingId === license.id ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-brand-gold" />
                      <input
                        type="number"
                        value={license.price}
                        onChange={(e) => handlePriceChange(license.id, e.target.value)}
                        className="w-24 px-3 py-2 bg-white/5 border border-brand-gold/50 rounded-lg text-white text-xl font-bold focus:outline-none"
                        step="0.01"
                      />
                      <span className="text-slate-400">€</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gradient">{license.price}€</span>
                      <button onClick={() => setEditingId(license.id)} className="glass p-1.5 rounded-lg hover:bg-white/10">
                        <Edit className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Net après commission : <span className="text-white font-bold">{(license.price * 0.85).toFixed(2)}€</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4">{license.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {license.features.map((f, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Meta */}
                <div className="glass rounded-xl p-3 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between"><span>Format:</span> <span className="text-white">{license.format}</span></div>
                  <div className="flex justify-between"><span>Streams:</span> <span className="text-white">{license.streams}</span></div>
                  <div className="flex justify-between"><span>Distribution:</span> <span className="text-white">{license.distribution}</span></div>
                  <div className="flex justify-between"><span>Crédits:</span> <span className="text-white">{license.credits}</span></div>
                </div>

                {editingId === license.id && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 flex-1">
                      <Save className="w-4 h-4" /> Sauvegarder
                    </button>
                    <button onClick={() => setEditingId(null)} className="glass px-4 py-2 rounded-xl text-sm hover:bg-white/10">
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom License Section */}
          <div className="glass rounded-3xl p-8 border-2 border-dashed border-white/10 text-center">
            <FileText className="w-12 h-12 text-brand-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Créer une licence personnalisée</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Définissez des termes spécifiques pour répondre aux besoins particuliers de vos clients. Idéal pour les collaborations sur mesure.
            </p>
            <button className="btn-primary px-6 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" /> Nouvelle licence
            </button>
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
