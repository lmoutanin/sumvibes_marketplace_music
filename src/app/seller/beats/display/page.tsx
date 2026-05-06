"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
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
import { resolveFileUrl } from "@/lib/resolve-file";

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
  mp3FileUrl: string | null;
  wavFileUrl: string | null;
  trackoutFileUrl: string | null;
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
  bpm: string;
  key: string;
  duration: string;
  genre: string[];
  mood: string[];
  instruments: string[];
  tags: string;
  mp3File: File | null;
  wavFile: File | null;
  trackoutFile: File | null;
  mp3FileUrl: string | null;
  wavFileUrl: string | null;
  trackoutFileUrl: string | null;
  basicPrice: string;
  premiumPrice: string;
  exclusivePrice: string;
  status: string;
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
  "Bouyon",
  "Shatta",
  "Dembow",
  "K-Pop",
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

const KEYS = [
  "C", "D", "E", "F", "G", "A", "B",
  "Cm", "Dm", "Em", "Fm", "Gm", "Am"
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
    bpm: b.bpm?.toString() ?? "",
    key: b.key ?? "",
    duration: b.duration?.toString() ?? "",
    genre: b.genre,
    mood: b.mood,
    instruments: b.instruments,
    tags: b.tags.join(", "),
    mp3File: null,
    wavFile: null,
    trackoutFile: null,
    mp3FileUrl: b.mp3FileUrl ?? null,
    wavFileUrl: b.wavFileUrl ?? null,
    trackoutFileUrl: b.trackoutFileUrl ?? null,
    basicPrice: b.basicPrice ?? "",
    premiumPrice: b.premiumPrice ?? "",
    exclusivePrice: b.exclusivePrice ?? "",
    status: b.status,
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
      className={`w-full px-4 py-3 bg-white/[0.07] border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
    />
  );
}

function STextarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 bg-white/[0.07] border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200 text-sm resize-none ${className}`}
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
        className="w-full px-4 py-3 bg-white/[0.07] border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200 text-sm outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
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
      className={`px-3 py-1.5 rounded-none text-[11px] font-bold uppercase tracking-wide border transition-all duration-150 ${active
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
  const { user } = useAuth();
  const plan = user?.subscription?.plan;
  const isFreemium = plan === "FREEMIUM" || !user?.subscription;
  const isPremium = plan === "PREMIUM_MONTHLY" || plan === "PREMIUM_YEARLY";
  const [edit, setEdit] = useState<EditState>(beatToEdit(beat));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(beat.coverImage ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "audio" | "tags" | "prix">("info");
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<string>("");

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
      // ── 1. Upload new files to R2 via presign if any ──────────────────────
      const uploadToR2 = async (
        file: File,
        category: "audio" | "cover" | "stems",
        label: string
      ): Promise<string> => {
        setUploadStatus(`Préparation de l'upload: ${label}...`);
        const presignRes = await fetch("/api/presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            category,
            fileSize: file.size,
          }),
        });
        if (!presignRes.ok) {
          const err = await presignRes.json();
          throw new Error(err.error || "Impossible d'obtenir l'URL d'upload");
        }
        const { uploadUrl, key } = await presignRes.json();

        setUploadStatus(`Upload de ${label}...`);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(prev => ({ ...prev, [label]: percent }));
            }
          };

          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error(`Upload échoué: HTTP ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Erreur réseau"));
          xhr.send(file);
        });

        return key;
      };

      let coverKey: string | null = null;
      let mp3Key: string | null = null;
      let wavKey: string | null = null;
      let trackoutKey: string | null = null;

      if (coverFile) coverKey = await uploadToR2(coverFile, "cover", "Image de couverture");
      if (edit.mp3File) mp3Key = await uploadToR2(edit.mp3File, "audio", "Fichier MP3");
      if (edit.wavFile) wavKey = await uploadToR2(edit.wavFile, "audio", "Fichier WAV");
      if (edit.trackoutFile) trackoutKey = await uploadToR2(edit.trackoutFile, "stems", "Fichier Trackout");

      setUploadStatus("Mise à jour de la base de données...");

      // ── 2. Send metadata + R2 keys to the PATCH endpoint ─────────────────
      const fd = new FormData();
      fd.append("title", edit.title);
      fd.append("description", edit.description);
      fd.append("bpm", edit.bpm);
      fd.append("key", edit.key);
      fd.append("duration", edit.duration);
      fd.append("basicPrice", edit.basicPrice);
      fd.append("premiumPrice", edit.premiumPrice);
      fd.append("exclusivePrice", edit.exclusivePrice);
      fd.append("status", edit.status);
      edit.genre.forEach((g) => fd.append("genre", g));
      edit.mood.forEach((m) => fd.append("mood", m));
      edit.instruments.forEach((i) => fd.append("instruments", i));

      if (coverKey) fd.append("coverKey", coverKey);
      if (mp3Key) fd.append("mp3Key", mp3Key);
      if (wavKey) fd.append("wavKey", wavKey);
      if (trackoutKey) fd.append("trackoutKey", trackoutKey);

      const res = await fetch(`/api/beats/${beat.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
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
    { key: "audio" as const, label: "Fichiers" },
    { key: "tags" as const, label: "Tags" },
    { key: "prix" as const, label: "Prix" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-[#021145] border-l border-white/10 flex flex-col shadow-[−20px_0_60px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/[0.05] border border-white/10">
            {coverPreview ? (
              <Image
                src={resolveFileUrl(coverPreview)}
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
        <div className="flex gap-2 px-6 pt-4 pb-4 shrink-0 overflow-x-auto border-b border-white/[0.07] hide-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === t.key
                ? "bg-brand-gold text-slate-900 shadow-md"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent"
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
                  <SSelect
                    value={edit.key}
                    onChange={(v) => set("key", v)}
                    options={[
                      { value: "", label: "Non défini" },
                      ...KEYS.map((k) => ({ value: k, label: k })),
                    ]}
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
                  className={`relative h-36 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all group ${isDragging
                    ? "border-brand-gold bg-brand-gold/10"
                    : "border-white/10 hover:border-white/25 bg-white/[0.02]"
                    }`}
                >
                  {coverPreview ? (
                    <>
                      <Image
                        src={resolveFileUrl(coverPreview)}
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
            </div>
          )}

          {/* ── TAB AUDIO ── */}
          {activeTab === "audio" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300 font-semibold mb-3">Fichier MP3 (Obligatoire)</p>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) set("mp3File", f);
                  }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 transition-all"
                />
                {(edit.mp3File || edit.mp3FileUrl) && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate">Actuel: {edit.mp3File ? edit.mp3File.name : edit.mp3FileUrl?.split("/").pop()}</p>
                )}
              </div>

              <div className={`p-4 rounded-xl border ${isFreemium ? 'bg-slate-800/50 border-white/5 opacity-50' : 'bg-brand-gold/10 border-brand-gold/20'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-semibold ${isFreemium ? 'text-slate-500' : 'text-brand-gold'}`}>Fichier WAV (Haute Qualité)</p>
                  {isFreemium && <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 font-bold">Standard min.</span>}
                </div>
                <input
                  type="file"
                  accept="audio/wav,audio/x-wav"
                  disabled={isFreemium}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) set("wavFile", f);
                  }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/30 disabled:opacity-50 transition-all cursor-pointer"
                />
                {(edit.wavFile || edit.wavFileUrl) && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate">Actuel: {edit.wavFile ? edit.wavFile.name : edit.wavFileUrl?.split("/").pop()}</p>
                )}
              </div>

              <div className={`p-4 rounded-xl border ${!isPremium ? 'bg-slate-800/50 border-white/5 opacity-50' : 'bg-purple-500/10 border-purple-500/20'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-semibold ${!isPremium ? 'text-slate-500' : 'text-purple-400'}`}>Fichier Trackout (ZIP/RAR)</p>
                  {!isPremium && <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 font-bold">Premium requis</span>}
                </div>
                <input
                  type="file"
                  accept=".zip,.rar,application/zip,application/x-rar-compressed"
                  disabled={!isPremium}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) set("trackoutFile", f);
                  }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 disabled:opacity-50 transition-all cursor-pointer"
                />
                {(edit.trackoutFile || edit.trackoutFileUrl) && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate">Actuel: {edit.trackoutFile ? edit.trackoutFile.name : edit.trackoutFileUrl?.split("/").pop()}</p>
                )}
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
                    color: "border-white/10",
                    disabled: false,
                    lockMsg: null,
                  },
                  {
                    name: "premiumPrice",
                    label: "Non-Exclusif",
                    sub: "WAV + MP3 · Commercial",
                    color: "border-brand-gold/25",
                    disabled: isFreemium || (!edit.wavFile && !edit.wavFileUrl),
                    lockMsg: isFreemium ? "Abonnement Standard. min." : "Upload WAV requis (Onglet Fichiers)",
                  },
                  {
                    name: "exclusivePrice",
                    label: "Exclusif",
                    sub: "Tous formats · Droits exclusifs",
                    color: "border-purple-400/25",
                    disabled: !isPremium || (!edit.trackoutFile && !edit.trackoutFileUrl),
                    lockMsg: !isPremium ? "Abonnement Premium requis" : "Upload ZIP/RAR requis",
                  },
                ] as const
              ).map(({ name, label, sub, color, disabled, lockMsg }) => (
                <div
                  key={name}
                  className={`p-5 rounded-2xl bg-white/[0.03] border transition-all ${disabled ? "opacity-50 grayscale border-slate-700 pointer-events-none" : color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-white font-bold text-sm">{label}</p>
                        <p className="text-slate-600 text-[11px]">{sub}</p>
                      </div>
                    </div>
                    {disabled && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded border border-white/5">{lockMsg}</span>}
                  </div>
                  <div className={`flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 ${disabled ? 'opacity-40' : ''}`}>
                    <span className="text-slate-400 font-bold text-sm">€</span>
                    <SInput
                      type="number"
                      disabled={disabled}
                      value={edit[name as keyof EditState] as string}
                      onChange={(e) =>
                        set(name as keyof EditState, e.target.value)
                      }
                      placeholder="0.00"
                      className="border-none bg-transparent px-0 py-0 text-white text-xl font-black focus:ring-0 disabled:text-slate-500"
                    />
                  </div>
                </div>
              ))}
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
        <div className="px-6 py-4 border-t border-white/[0.07] shrink-0 space-y-4 bg-black/20">
          {(saving || Object.keys(uploadProgress).length > 0) && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{uploadStatus || "Préparation..."}</p>
              {Object.entries(uploadProgress).map(([label, progress]) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{label}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                    <div
                      className="h-full bg-brand-gold transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 rounded-xl border border-white/12 text-slate-400 text-sm font-semibold hover:border-white/25 hover:text-white transition-all disabled:opacity-30"
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
    </div >
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
    ? beat.coverImage.startsWith("http") || beat.coverImage.startsWith("/")
      ? beat.coverImage
      : beat.coverImage.startsWith("images/")
        ? `${(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, '')}/${beat.coverImage}`
        : beat.coverImage.startsWith("/uploads")
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
  const [beatPublished, setBeatPublished] = useState<number>(0);
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
        } catch { }
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${filter === s
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
