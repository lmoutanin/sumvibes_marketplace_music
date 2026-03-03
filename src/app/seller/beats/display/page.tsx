"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import {
  Music,
  Zap,
  Clock,
  Plus,
  TrendingUp,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Key,
  Check,
  X,
  Save,
  ChevronDown,
  Pencil,
  ImagePlus,
  Tag,
  Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Beat = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  bpm: number | null;
  duration: number | null;
  key: string | null;
  genre: string[];
  mood: string[];
  instruments: string[];
  tags: string[];
  basicPrice: string | null;
  premiumPrice: string | null;
  exclusivePrice: string | null;
  status: string;
  plays: number;
  sales: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
};

type EditState = {
  title: string;
  description: string;
  slug: string;
  bpm: string;
  key: string;
  duration: string;
  genre: string[];
  mood: string[];
  instruments: string[];
  tags: string;
  basicPrice: string;
  premiumPrice: string;
  exclusivePrice: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  string,
  { label: string; dot: string; text: string; pill: string }
> = {
  PUBLISHED: {
    label: "Publié",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    pill: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300",
  },
  PENDING: {
    label: "En attente",
    dot: "bg-amber-400",
    text: "text-amber-300",
    pill: "bg-amber-400/10 border-amber-400/25 text-amber-300",
  },
  DRAFT: {
    label: "Brouillon",
    dot: "bg-slate-500",
    text: "text-slate-400",
    pill: "bg-slate-500/10 border-slate-500/25 text-slate-400",
  },
  REJECTED: {
    label: "Rejeté",
    dot: "bg-red-400",
    text: "text-red-300",
    pill: "bg-red-400/10 border-red-400/25 text-red-300",
  },
  ARCHIVED: {
    label: "Archivé",
    dot: "bg-slate-600",
    text: "text-slate-500",
    pill: "bg-slate-600/10 border-slate-600/25 text-slate-500",
  },
};
const STATUSES = ["PUBLISHED", "PENDING", "DRAFT", "REJECTED", "ARCHIVED"];

const GENRES = [
  "Trap",
  "Rnb",
  "Pop",
  "Hip-Hop",
  "Afrobeat",
  "Drill",
  "Reggaeton",
  "Lo-Fi",
  "Soul",
  "Dancehall",
  "Electro",
  "Jazz",
];

const MOODS = [
  "Dark",
  "Chill",
  "Uplifting",
  "Energetic",
  "Romantic",
  "Aggressive",
  "Melancholic",
];
const INSTRUMENTS = [
  "Piano",
  "Guitar",
  "Synth",
  "Drums",
  "Bass",
  "Strings",
  "Brass",
  "Flute",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const lowestPrice = (beat: Beat) => {
  const p = [beat.basicPrice, beat.premiumPrice, beat.exclusivePrice]
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);
  return p.length ? `${Math.min(...p)}€` : "—";
};

function beatToEdit(b: Beat): EditState {
  return {
    title: b.title,
    description: b.description ?? "",
    slug: b.slug,
    bpm: b.bpm?.toString() ?? "",
    key: b.key ?? "",
    duration: b.duration?.toString() ?? "",
    genre: b.genre,
    mood: b.mood,
    instruments: b.instruments,
    tags: b.tags.join(", "),
    basicPrice: b.basicPrice ?? "",
    premiumPrice: b.premiumPrice ?? "",
    exclusivePrice: b.exclusivePrice ?? "",
    status: b.status,
    seoTitle: b.seoTitle ?? "",
    seoDescription: b.seoDescription ?? "",
  };
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
      {children}
    </p>
  );
}

function SInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-slate-600
        focus:outline-none focus:border-brand-gold/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-brand-gold/20 transition-all
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
    />
  );
}

function STextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-slate-600
        focus:outline-none focus:border-brand-gold/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
    />
  );
}

function SSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm
          focus:outline-none focus:border-brand-gold/50 transition-all pr-8 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0d0d12]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all duration-150 ${
        active
          ? "bg-brand-gold border-brand-gold text-slate-900 shadow-[0_2px_10px_rgba(212,175,55,0.4)]"
          : "bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function BeatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 flex gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-white/[0.06] shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-white/[0.06] rounded-lg w-2/5" />
        <div className="h-3 bg-white/[0.04] rounded-lg w-1/3" />
      </div>
    </div>
  );
}

// ─── Edit Modal (Drawer) ──────────────────────────────────────────────────────

function EditModal({
  beat,
  token,
  onClose,
  onSaved,
}: {
  beat: Beat;
  token: string;
  onClose: () => void;
  onSaved: (b: Beat) => void;
}) {
  const [edit, setEdit] = useState<EditState>(beatToEdit(beat));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(beat.coverImage ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "tags" | "prix" | "seo">(
    "info",
  );
  const coverRef = useRef<HTMLInputElement>(null);

  // Fermer sur Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Empêche le scroll du body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = <K extends keyof EditState>(key: K, val: EditState[K]) =>
    setEdit((p) => ({ ...p, [key]: val }));

  const toggleArr = (key: "genre" | "mood" | "instruments", val: string) =>
    setEdit((p) => ({
      ...p,
      [key]: p[key].includes(val)
        ? p[key].filter((v) => v !== val)
        : [...p[key], val],
    }));

  const applyFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (
        coverPreview &&
        !coverPreview.startsWith("http") &&
        !coverPreview.startsWith("/uploads")
      ) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    },
    [coverPreview],
  );

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      let body: BodyInit;
      const headers: Record<string, string> = { Authorization: `JWT ${token}` };

      if (coverFile) {
        // ✅ Avec une nouvelle cover : FormData (pas de Content-Type manuel, le browser le set)
        const fd = new FormData();
        fd.append("title", edit.title);
        fd.append("description", edit.description);
        fd.append("slug", edit.slug);
        fd.append("bpm", edit.bpm);
        fd.append("key", edit.key);
        fd.append("duration", edit.duration);
        fd.append("basicPrice", edit.basicPrice);
        fd.append("premiumPrice", edit.premiumPrice);
        fd.append("exclusivePrice", edit.exclusivePrice);
        fd.append("status", edit.status);
        fd.append("seoTitle", edit.seoTitle);
        fd.append("seoDescription", edit.seoDescription);
        fd.append("tags", edit.tags);
        edit.genre.forEach((g) => fd.append("genre", g));
        edit.mood.forEach((m) => fd.append("mood", m));
        edit.instruments.forEach((i) => fd.append("instruments", i));
        fd.append("cover", coverFile);
        body = fd;
      } else {
        // ✅ Sans cover : JSON simple
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          title: edit.title,
          description: edit.description,
          slug: edit.slug,
          bpm: edit.bpm ? Number(edit.bpm) : null,
          key: edit.key || null,
          duration: edit.duration ? Number(edit.duration) : null,
          basicPrice: edit.basicPrice ? Number(edit.basicPrice) : null,
          premiumPrice: edit.premiumPrice ? Number(edit.premiumPrice) : null,
          exclusivePrice: edit.exclusivePrice
            ? Number(edit.exclusivePrice)
            : null,
          status: edit.status,
          seoTitle: edit.seoTitle,
          seoDescription: edit.seoDescription,
          tags: edit.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          genre: edit.genre,
          mood: edit.mood,
          instruments: edit.instruments,
        });
      }

      const res = await fetch(`/api/beats/${beat.id}`, {
        method: "PATCH",
        headers,
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      onSaved(data.beat);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { key: "info" as const, label: "Infos" },
    { key: "tags" as const, label: "Tags" },
    { key: "prix" as const, label: "Prix" },
    { key: "seo" as const, label: "SEO" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-[#0a0a0f] border-l border-white/10 flex flex-col shadow-[−20px_0_60px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/[0.05] border border-white/10">
            {coverPreview ? (
              <Image
                src={
                  coverPreview.startsWith("blob:") ||
                  coverPreview.startsWith("http")
                    ? coverPreview
                    : `/uploads/covers/${coverPreview}`
                }
                alt={edit.title}
                fill
                sizes="48px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Music className="w-5 h-5 text-slate-600 m-auto mt-3" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-base truncate">
              {edit.title || "Sans titre"}
            </p>
            <StatusBadge status={edit.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === t.key
                  ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/30"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* ── TAB INFOS ── */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div>
                <SLabel>Titre *</SLabel>
                <SInput
                  value={edit.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Midnight Vibes"
                />
              </div>
              <div>
                <SLabel>Description</SLabel>
                <STextarea
                  value={edit.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  placeholder="Ambiance, histoire du beat..."
                />
              </div>
              <div>
                <SLabel>Slug</SLabel>
                <SInput
                  value={edit.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="midnight-vibes"
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <SLabel>BPM</SLabel>
                  <SInput
                    type="number"
                    value={edit.bpm}
                    onChange={(e) => set("bpm", e.target.value)}
                    placeholder="140"
                  />
                </div>
                <div>
                  <SLabel>Tonalité</SLabel>
                  <SInput
                    value={edit.key}
                    onChange={(e) => set("key", e.target.value)}
                    placeholder="Am"
                  />
                </div>
                <div>
                  <SLabel>Durée (s)</SLabel>
                  <SInput
                    type="number"
                    value={edit.duration}
                    onChange={(e) => set("duration", e.target.value)}
                    placeholder="180"
                  />
                </div>
              </div>
              <div>
                <SLabel>Statut</SLabel>
                <SSelect
                  value={edit.status}
                  onChange={(v) => set("status", v)}
                  options={STATUSES.map((s) => ({
                    value: s,
                    label: STATUS_MAP[s].label,
                  }))}
                />
              </div>

              {/* Cover upload */}
              <div>
                <SLabel>Cover</SLabel>
                <div
                  onClick={() => coverRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) applyFile(f);
                  }}
                  className={`relative h-36 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all group ${
                    isDragging
                      ? "border-brand-gold bg-brand-gold/10"
                      : "border-white/10 hover:border-white/25 bg-white/[0.02]"
                  }`}
                >
                  {coverPreview ? (
                    <>
                      <Image
                        src={
                          coverPreview.startsWith("blob:") ||
                          coverPreview.startsWith("http")
                            ? coverPreview
                            : `/uploads/covers/${coverPreview}`
                        }
                        alt="cover"
                        fill
                        sizes="600px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-semibold">
                        <ImagePlus className="w-4 h-4" /> Changer
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                      <ImagePlus className="w-8 h-8" />
                      <p className="text-xs">
                        Glisse ou clique pour uploader la cover
                      </p>
                    </div>
                  )}
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) applyFile(f);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB TAGS ── */}
          {activeTab === "tags" && (
            <div className="space-y-6">
              {(
                [
                  ["Genres", "genre", GENRES],
                  ["Ambiances", "mood", MOODS],
                  ["Instruments", "instruments", INSTRUMENTS],
                ] as [
                  "Genres" | "Ambiances" | "Instruments",
                  "genre" | "mood" | "instruments",
                  string[],
                ][]
              ).map(([label, key, list]) => (
                <div key={key}>
                  <SLabel>{label}</SLabel>
                  <div className="flex flex-wrap gap-2">
                    {list.map((item) => (
                      <Chip
                        key={item}
                        active={edit[key].includes(item)}
                        onClick={() => toggleArr(key, item)}
                      >
                        {item}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <SLabel>Tags libres (séparés par virgules)</SLabel>
                <SInput
                  value={edit.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="trap, nuit, mélancolique..."
                />
              </div>
            </div>
          )}

          {/* ── TAB PRIX ── */}
          {activeTab === "prix" && (
            <div className="space-y-4">
              {(
                [
                  {
                    name: "basicPrice",
                    label: "Basic",
                    sub: "MP3 · Non-commercial",
                    icon: "🎧",
                    color: "border-white/10",
                  },
                  {
                    name: "premiumPrice",
                    label: "Premium",
                    sub: "WAV + MP3 · Commercial",
                    icon: "⭐",
                    color: "border-brand-gold/25",
                  },
                  {
                    name: "exclusivePrice",
                    label: "Exclusif",
                    sub: "Tous formats · Droits exclusifs",
                    icon: "👑",
                    color: "border-purple-400/25",
                  },
                ] as const
              ).map(({ name, label, sub, icon, color }) => (
                <div
                  key={name}
                  className={`p-5 rounded-2xl bg-white/[0.03] border ${color}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-slate-600 text-[11px]">{sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5">
                    <span className="text-slate-400 font-bold text-sm">€</span>
                    <SInput
                      type="number"
                      value={edit[name as keyof EditState] as string}
                      onChange={(e) =>
                        set(name as keyof EditState, e.target.value)
                      }
                      placeholder="0.00"
                      className="border-none bg-transparent px-0 py-0 text-white text-xl font-black focus:ring-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB SEO ── */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-brand-gold/10 border border-brand-gold/20">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  Le SEO améliore ta visibilité sur Google. Ces champs sont{" "}
                  <span className="text-brand-gold font-semibold">
                    optionnels
                  </span>
                  .
                </p>
              </div>
              <div>
                <SLabel>Titre SEO</SLabel>
                <SInput
                  value={edit.seoTitle}
                  onChange={(e) => set("seoTitle", e.target.value)}
                  placeholder="Beat Trap 140 BPM – Mon artiste"
                />
                <p className="text-[11px] text-slate-700 mt-1">
                  {edit.seoTitle.length}/60 caractères
                </p>
              </div>
              <div>
                <SLabel>Description SEO</SLabel>
                <STextarea
                  value={edit.seoDescription}
                  onChange={(e) => set("seoDescription", e.target.value)}
                  rows={3}
                  placeholder="Beat trap sombre avec piano mélancolique..."
                />
                <p className="text-[11px] text-slate-700 mt-1">
                  {edit.seoDescription.length}/160 caractères
                </p>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/12 text-slate-400 text-sm font-semibold hover:border-white/25 hover:text-white transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50
              ${saved ? "bg-emerald-500 text-white" : "bg-brand-gold text-slate-900 hover:brightness-110 shadow-[0_4px_20px_rgba(212,175,55,0.3)]"}`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" /> Sauvegardé !
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BeatRow ──────────────────────────────────────────────────────────────────

function BeatRow({
  beat,
  onEdit,
  onDelete,
}: {
  beat: Beat;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const s = STATUS_MAP[beat.status] ?? STATUS_MAP.DRAFT;
  const coverSrc = beat.coverImage
    ? beat.coverImage.startsWith("http") ||
      beat.coverImage.startsWith("/uploads")
      ? beat.coverImage
      : `/uploads/covers/${beat.coverImage}`
    : null;

  return (
    <li
      className="group flex items-center gap-5 p-5 rounded-2xl border border-white/[0.15] bg-white/[0.06]
        hover:bg-white/[0.09] hover:border-white/30 hover:shadow-[0_4px_30px_rgba(0,0,0,0.5)]
        transition-all duration-200"
    >
      {/* Cover */}
      <div
        className="relative rounded-2xl overflow-hidden shrink-0 bg-white/[0.08] border border-white/[0.15]"
        style={{ width: 72, height: 72 }}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={beat.title}
            fill
            sizes="72px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <Music className="w-7 h-7 text-slate-500" />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        {/* Titre + badge */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="font-black text-white text-base truncate leading-tight">
            {beat.title}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-[12px] text-slate-400 flex-wrap">
          {beat.bpm && (
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-500" />
              {beat.bpm} BPM
            </span>
          )}
          {beat.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {fmt(beat.duration)}
            </span>
          )}
          {beat.key && (
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              {beat.key}
            </span>
          )}
          {beat.genre.length > 0 && (
            <span className="text-slate-500">
              {beat.genre.slice(0, 2).join(", ")}
            </span>
          )}
        </div>
        {/* Stats */}
        <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-600">
          <span>{beat.plays} écoutes</span>
          <span>{beat.sales} ventes</span>
        </div>
      </div>

      {/* Prix */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-brand-gold font-black text-lg">
          {lowestPrice(beat)}
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">à partir de</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-slate-300 text-sm font-bold shrink-0
            hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/8 transition-all duration-150
            shadow-sm hover:shadow-[0_0_12px_rgba(212,175,55,0.2)]"
        >
          <Pencil className="w-4 h-4" /> Modifier
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-300 text-sm font-bold shrink-0
            hover:border-red-500 hover:text-white hover:bg-red-500/10 transition-all duration-150"
        >
          <Trash2 className="w-4 h-4" /> Supprimer
        </button>
      </div>
    </li>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function SellerBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [token, setToken] = useState("");
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  // Suppression d'un beat
  const handleDelete = async (beat: Beat) => {
    if (
      !window.confirm(
        `Supprimer le beat "${beat.title}" ? Cette action est irréversible.`,
      )
    )
      return;
    try {
      const t = localStorage.getItem("token") ?? "";
      const res = await fetch(`/api/beats/${beat.id}`, {
        method: "DELETE",
        headers: { Authorization: `JWT ${t}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }
      setBeats((prev) => prev.filter((b) => b.id !== beat.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const t = localStorage.getItem("token") ?? "";
        setToken(t);
        if (!t) {
          setError("non_auth");
          setLoading(false);
          return;
        }
        let sellerId = "";
        try {
          const p = JSON.parse(atob(t.split(".")[1]));
          sellerId = p.userId;
        } catch {}
        const res = await fetch(`/api/beats?sellerId=${sellerId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBeats(data.beats ?? []);
      } catch {
        setError("server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaved = (updated: Beat) => {
    setBeats((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // On ne garde que les beats non supprimés
  const visibleBeats = beats.filter((b) => b.status !== "DELETED");
  const filtered =
    filter === "ALL"
      ? visibleBeats
      : visibleBeats.filter((b) => b.status === filter);
  const totalPlays = visibleBeats.reduce((a, b) => a + b.plays, 0);
  const totalSales = visibleBeats.reduce((a, b) => a + b.sales, 0);
  const published = visibleBeats.filter((b) => b.status === "PUBLISHED").length;

  if (!loading && error === "non_auth")
    return (
      <div className="min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-28 flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-white font-bold text-xl">
            Tu n&apos;es pas connecté
          </p>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-brand-gold text-slate-900 text-sm font-black hover:brightness-110 transition-all"
          >
            Se connecter
          </Link>
        </main>
      </div>
    );

  if (!loading && error === "server")
    return (
      <div className="min-h-screen bg-gradient-premium">
        <Navbar />
        <main className="pt-28 flex flex-col items-center gap-3 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/25 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white font-bold text-xl">Erreur de chargement</p>
          <button
            onClick={() => window.location.reload()}
            className="text-brand-gold underline text-sm"
          >
            Réessayer
          </button>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-premium">
      <Navbar />
      {/* Marge supplémentaire entre le header et le main */}
      <div style={{ height: 32 }} />

      {/* Modal édition */}
      {editingBeat && (
        <EditModal
          beat={editingBeat}
          token={token}
          onClose={() => setEditingBeat(null)}
          onSaved={(updated) => {
            handleSaved(updated);
          }}
        />
      )}

      <main className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Mes Beats
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Clique sur{" "}
              <span className="text-brand-gold font-semibold">Modifier</span>{" "}
              pour éditer un beat
            </p>
          </div>
          <Link
            href="/seller/beats/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-slate-900 text-sm font-black
              hover:brightness-110 active:scale-[0.97] transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
          >
            <Plus className="w-4 h-4" /> Nouveau beat
          </Link>
        </div>

        {/* Stats */}
        {!loading && beats.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              {
                label: "Publiés",
                value: published,
                icon: Music,
                color: "text-emerald-400",
              },
              {
                label: "Écoutes",
                value: totalPlays,
                icon: TrendingUp,
                color: "text-brand-gold",
              },
              {
                label: "Ventes",
                value: totalSales,
                icon: ShoppingBag,
                color: "text-violet-400",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="glass rounded-2xl border border-white/[0.08] p-4 text-center"
              >
                <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        {!loading && beats.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {["ALL", "PUBLISHED", "PENDING", "DRAFT", "REJECTED"].map((s) => {
              const count =
                s === "ALL"
                  ? beats.length
                  : beats.filter((b) => b.status === s).length;
              if (s !== "ALL" && count === 0) return null;
              const label = s === "ALL" ? "Tous" : (STATUS_MAP[s]?.label ?? s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filter === s
                      ? "bg-brand-gold border-brand-gold text-slate-900"
                      : "bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  {label} <span className="opacity-50 ml-1">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <BeatSkeleton key={i} />
            ))}
          </div>
        ) : beats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <Music className="w-9 h-9 text-slate-700" />
            </div>
            <div>
              <p className="text-white/80 font-bold text-lg">
                Aucun beat pour l&apos;instant
              </p>
              <p className="text-slate-600 text-sm mt-1">
                Ajoute ton premier beat pour qu&apos;il apparaisse ici.
              </p>
            </div>
            <Link
              href="/seller/beats/"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-gold text-slate-900 text-sm font-black hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
            >
              <Plus className="w-4 h-4" /> Ajouter un beat
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-600 py-12 text-sm">
            Aucun beat dans cette catégorie.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((beat) => (
              <BeatRow
                key={beat.id}
                beat={beat}
                onEdit={() => setEditingBeat(beat)}
                onDelete={() => handleDelete(beat)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
