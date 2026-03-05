"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Music, Play, Pause, X, Check, ShoppingCart, Zap, Crown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LicenseType = "BASIC" | "PREMIUM" | "EXCLUSIVE";

export interface LicenseOption {
  type: LicenseType;
  label: string;
  price: number | null;
  icon: React.ReactNode;
  color: string;
  accent: string;
  accentBg: string;
  perks: string[];
  tag?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function coverSrc(raw: string) {
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/covers/${raw}`;
}

export function buildLicenses(beat: any): LicenseOption[] {
  const basic     = beat.basicPrice     != null ? Number(beat.basicPrice)     : null;
  const premium   = beat.premiumPrice   != null ? Number(beat.premiumPrice)   : null;
  const exclusive = beat.exclusivePrice != null ? Number(beat.exclusivePrice) : null;

  return [
    {
      type: "BASIC",
      label: "Basic",
      price: basic,
      icon: <Music className="w-5 h-5" />,
      color: "from-slate-400/15 to-slate-500/5 border-white/10",
      accent: "text-slate-300",
      accentBg: "bg-white/10 hover:bg-white/20 text-white",
      perks: [
        "MP3 Lease",
        "Distribution jusqu'à 5 000 copies",
        "2 000 streams",
        "Non-exclusif",
      ],
    },
    {
      type: "PREMIUM",
      label: "Premium",
      price: premium,
      icon: <Zap className="w-5 h-5" />,
      color: "from-brand-gold/20 to-amber-500/5 border-brand-gold/30",
      accent: "text-brand-gold",
      accentBg: "bg-brand-gold hover:brightness-110 text-slate-900",
      tag: "Populaire",
      perks: [
        "WAV + MP3 Lease",
        "Distribution illimitée",
        "100 000 streams",
        "Utilisation commerciale",
        "Non-exclusif",
      ],
    },
    {
      type: "EXCLUSIVE",
      label: "Exclusive",
      price: exclusive,
      icon: <Crown className="w-5 h-5" />,
      color: "from-violet-500/20 to-purple-600/5 border-violet-400/30",
      accent: "text-violet-300",
      accentBg: "bg-violet-500 hover:bg-violet-400 text-white",
      tag: "Tout inclus",
      perks: [
        "WAV + MP3 + Stems",
        "Distribution & streams illimités",
        "Droits d'auteur transférés",
        "Beat retiré du catalogue",
        "Exclusivité totale",
      ],
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LicensePickerModal({
  beat, onClose, onAdd, isPlaying, onTogglePlay,
}: {
  beat: any | null;
  onClose: () => void;
  onAdd: (beatId: string, license: LicenseType) => Promise<boolean>;
  isPlaying?: boolean;
  onTogglePlay?: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [submittingLicense, setSubmittingLicense] = useState<LicenseType | null>(null);

  useEffect(() => {
    if (!beat) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [beat, onClose]);

  useEffect(() => {
    document.body.style.overflow = beat ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [beat]);

  if (!beat) return null;

  const licenses = buildLicenses(beat);
  const genre0 = beat.genre?.[0] ?? "";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

      <div className="relative w-full sm:max-w-2xl mx-auto sm:mx-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="glass rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0c0c14]/95 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/60">

          {/* Header */}
          <div className="flex items-center gap-4 p-5 border-b border-white/[0.07]">
            <div className="w-14 h-14 rounded-xl overflow-hidden relative bg-white/5 flex-shrink-0">
              {beat.coverImage
                ? <Image src={coverSrc(beat.coverImage)} alt={beat.title} fill sizes="56px" className="object-cover" />
                : <Music className="w-6 h-6 absolute inset-0 m-auto text-white/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-0.5">Choisir une licence</p>
              <h2 className="font-bold text-base leading-tight truncate text-white">{beat.title}</h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {beat.seller?.displayName || beat.seller?.username}
                {beat.bpm && <span className="ml-2 text-slate-600">· {beat.bpm} BPM</span>}
                {beat.key && <span className="ml-1 text-slate-600">· {beat.key}</span>}
                {genre0 && <span className="ml-1 text-slate-600">· {genre0}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onTogglePlay && (
                <button
                  onClick={() => onTogglePlay(beat.id)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-gold/20 border border-white/10 hover:border-brand-gold/40 flex items-center justify-center transition-all"
                >
                  {isPlaying
                    ? <Pause className="w-4 h-4 text-brand-gold fill-current" />
                    : <Play className="w-4 h-4 text-brand-gold fill-current ml-0.5" />}
                </button>
              )}
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Cards de licence */}
          <div className="p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
            {licenses.map((lic) => {
              const unavailable = lic.price === null;
              return (
                <div
                  key={lic.type}
                  className={`relative rounded-2xl bg-gradient-to-b ${lic.color} border p-4 flex flex-col gap-3 transition-transform duration-200 ${
                    unavailable ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]"
                  }`}
                >
                  {lic.tag && !unavailable && (
                    <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                      lic.type === "PREMIUM" ? "bg-brand-gold text-slate-900" : "bg-violet-500 text-white"
                    }`}>
                      {lic.tag}
                    </span>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className={lic.accent}>{lic.icon}</span>
                    <span className={`font-bold text-sm ${lic.accent}`}>{lic.label}</span>
                  </div>

                  <div>
                    {unavailable
                      ? <span className="text-sm text-slate-500 italic">Non disponible</span>
                      : <span className={`text-2xl font-black ${lic.accent}`}>{lic.price!.toFixed(2)}€</span>}
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {lic.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-[12px] text-slate-300">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${lic.accent}`} />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={unavailable || submittingLicense !== null}
                    onClick={async () => {
                      if (unavailable || submittingLicense) return;
                      setSubmittingLicense(lic.type);
                      const ok = await onAdd(beat.id, lic.type);
                      setSubmittingLicense(null);
                      if (ok) onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      unavailable || submittingLicense !== null ? "bg-white/5 text-slate-600 cursor-not-allowed" : lic.accentBg
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {unavailable ? "Indisponible" : submittingLicense === lic.type ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-5 pb-5 pt-0 text-center">
            <p className="text-[11px] text-slate-600">
              🔒 Paiement sécurisé · Livraison instantanée · Licence PDF incluse
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
