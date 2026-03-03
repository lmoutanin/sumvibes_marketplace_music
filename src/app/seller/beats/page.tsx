"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Music,
  Tag,
  DollarSign,
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  ImagePlus,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";

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
];

const STEPS = [
  { id: 1, label: "Infos", icon: Music, color: "from-blue-500 to-indigo-600" },
  {
    id: 2,
    label: "Médias",
    icon: UploadCloud,
    color: "from-violet-500 to-purple-600",
  },
  { id: 3, label: "Tags", icon: Tag, color: "from-pink-500 to-rose-600" },
  {
    id: 4,
    label: "Prix",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
  },
  { id: 5, label: "SEO", icon: Search, color: "from-brand-gold to-yellow-500" },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  slug: "",
  previewUrl: "",
  mainFileUrl: "",
  cover: null as File | null,
  coverPreview: "",
  bpm: "",
  duration: "",
  key: "",
  genres: [] as string[],
  moods: [] as string[],
  instruments: [] as string[],
  tags: "",
  basicPrice: "",
  premiumPrice: "",
  exclusivePrice: "",
  status: "PENDING",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

type FormState = typeof INITIAL_FORM;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
      {children}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-white/[0.07] border border-white/20 rounded-xl text-white placeholder-slate-500
        focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-2 focus:ring-brand-gold/20
        transition-all duration-200 text-sm
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        ${className}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-3 bg-white/[0.07] border border-white/20 rounded-xl text-white placeholder-slate-500
        focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-2 focus:ring-brand-gold/20
        transition-all duration-200 text-sm resize-none"
    />
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
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-150 border ${
        active
          ? "bg-brand-gold border-brand-gold text-slate-900 shadow-[0_2px_12px_rgba(212,175,55,0.5)] scale-105"
          : "bg-white/5 border-white/15 text-slate-400 hover:bg-white/10 hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function SellerBeatsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  // ✅ stepRef miroir de step — évite la closure stale dans handleSubmit
  const stepRef = useRef(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  // ✅ Toujours utiliser goToStep pour naviguer — met à jour step ET stepRef ensemble
  const goToStep = (s: number) => {
    stepRef.current = s;
    setStep(s);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, title: e.target.value }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleMultiSelect = (
    key: "genres" | "moods" | "instruments",
    val: string,
  ) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].includes(val)
        ? p[key].filter((v: string) => v !== val)
        : [...p[key], val],
    }));

  const applyFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setForm((p: FormState) => {
      if (p.coverPreview) URL.revokeObjectURL(p.coverPreview);
      return { ...p, cover: file, coverPreview: URL.createObjectURL(file) };
    });
  }, []);

  const handleRemoveCover = useCallback(() => {
    setForm((p: FormState) => {
      if (p.coverPreview) URL.revokeObjectURL(p.coverPreview);
      return { ...p, cover: null, coverPreview: "" };
    });
  }, []);

  const buildFormData = (f: FormState): FormData => {
    const fd = new FormData();
    fd.append("title", f.title);
    fd.append("description", f.description);
    fd.append("slug", f.slug);
    fd.append("previewUrl", f.previewUrl);
    fd.append("mainFileUrl", f.mainFileUrl);
    fd.append("bpm", f.bpm);
    fd.append("duration", f.duration);
    fd.append("key", f.key);
    fd.append("tags", f.tags);
    fd.append("basicPrice", f.basicPrice);
    fd.append("premiumPrice", f.premiumPrice);
    fd.append("exclusivePrice", f.exclusivePrice);
    fd.append("status", f.status);
    fd.append("seoTitle", f.seoTitle);
    fd.append("seoDescription", f.seoDescription);
    fd.append("seoKeywords", f.seoKeywords);
    f.genres.forEach((g) => fd.append("genre", g));
    f.moods.forEach((m) => fd.append("moods", m));
    f.instruments.forEach((i) => fd.append("instruments", i));
    if (f.cover instanceof File) fd.append("cover", f.cover);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ stepRef.current toujours à jour (pas de closure stale)
    if (stepRef.current !== STEPS.length) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const fd = buildFormData(form);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("/api/beats", {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `JWT ${token}` } : {},
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erreur lors de l'ajout du beat");
      }

      setSuccess("Beat ajouté avec succès ! Redirection en cours...");

      // ✅ 2s pour lire le message, puis reset + redirection
      setTimeout(() => {
        setForm(INITIAL_FORM);
        goToStep(1);
        router.push("/seller/beats/display");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step - 1];

  const renderStep = (): React.ReactNode => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <FieldLabel>Titre du beat *</FieldLabel>
              <Input
                name="title"
                value={form.title}
                onChange={handleTitleChange}
                required
                placeholder="Ex : Midnight Vibes"
              />
            </div>
            <div>
              <FieldLabel>Slug (URL publique)</FieldLabel>
              <Input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="font-mono text-xs"
                placeholder="midnight-vibes"
                autoComplete="off"
              />
              <p className="text-[11px] text-slate-600 mt-1.5">
                Le slug sera automatiquement rendu unique lors de la
                publication.
              </p>
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Ambiance, inspiration, histoire du beat..."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* BPM */}
              <div>
                <FieldLabel>BPM</FieldLabel>
                <Input
                  type="number"
                  name="bpm"
                  value={form.bpm}
                  onChange={handleChange}
                  placeholder="140"
                />
              </div>
              {/* Durée */}
              <div>
                <FieldLabel>Durée (s)</FieldLabel>
                <Input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="180"
                />
              </div>
              {/* Tonalité */}
              <div>
                <FieldLabel>Tonalité</FieldLabel>
                <select
                  name="key"
                  value={form.key}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/[0.07] border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200 text-sm appearance-none dark:bg-white/[0.07] dark:text-white dark:border-white/20 dark:focus:bg-white/10"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    color: "#fff",
                  }}
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="Cm">Cm</option>
                  <option value="Dm">Dm</option>
                  <option value="Em">Em</option>
                  <option value="Fm">Fm</option>
                  <option value="Gm">Gm</option>
                  <option value="Am">Am</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>Cover du beat</FieldLabel>
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
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200 group
                  ${isDragging ? "border-brand-gold bg-brand-gold/10 scale-[1.01]" : "border-white/15 hover:border-white/30 bg-white/[0.03]"}`}
                style={{ height: 210 }}
              >
                {form.coverPreview ? (
                  <>
                    <Image
                      src={form.coverPreview}
                      alt="cover"
                      fill
                      sizes="(max-width: 560px) 100vw, 560px"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-white text-sm font-semibold">
                        <ImagePlus className="w-4 h-4" /> Changer l&apos;image
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCover();
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs text-white/70 font-medium">
                      {form.cover?.name}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200 ${isDragging ? "scale-110 border-brand-gold bg-brand-gold/10" : "group-hover:border-white/20"}`}
                    >
                      <UploadCloud
                        className={`w-7 h-7 ${isDragging ? "text-brand-gold" : "text-slate-500 group-hover:text-slate-300"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-300">
                        Glisse ton image ici
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        ou{" "}
                        <span className="text-brand-gold underline underline-offset-2">
                          clique pour parcourir
                        </span>{" "}
                        · PNG, JPG, WEBP
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) applyFile(f);
                  }}
                  className="hidden"
                />
              </div>
            </div>
            {(
              [
                [
                  "URL Preview MP3 *",
                  "previewUrl",
                  "https://cdn.monsite.com/preview.mp3",
                  "Extrait watermarké 30–60s diffusé aux visiteurs",
                ],
                [
                  "URL Fichier WAV *",
                  "mainFileUrl",
                  "https://cdn.monsite.com/beat.wav",
                  "Fichier haute qualité livré après achat",
                ],
              ] as const
            ).map(([label, name, ph, hint]) => (
              <div key={name}>
                <FieldLabel>{label}</FieldLabel>
                <Input
                  name={name}
                  value={form[name as keyof FormState] as string}
                  onChange={handleChange}
                  required
                  placeholder={ph}
                />
                <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />{" "}
                  {hint}
                </p>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-7">
            {(
              [
                ["Genres", "genres", GENRES],
                ["Ambiances", "moods", MOODS],
                ["Instruments", "instruments", INSTRUMENTS],
              ] as [
                "Genres" | "Ambiances" | "Instruments",
                "genres" | "moods" | "instruments",
                string[],
              ][]
            ).map(([label, key, list]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2.5">
                  <FieldLabel>{label}</FieldLabel>
                  {(form[key] as string[]).length > 0 && (
                    <span className="text-[10px] font-bold bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full border border-brand-gold/30">
                      {(form[key] as string[]).length} sélectionné
                      {(form[key] as string[]).length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((item) => (
                    <Chip
                      key={item}
                      active={(form[key] as string[]).includes(item)}
                      onClick={() => handleMultiSelect(key, item)}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <FieldLabel>Tags libres</FieldLabel>
              <Input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="trap, nuit, mélancolique, 808..."
              />
              <p className="text-[11px] text-slate-600 mt-1.5">
                Séparés par des virgules · améliorent ta visibilité
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-5">
              Définis tes tarifs pour chaque niveau de licence. Laisse vide pour
              désactiver.
            </p>
            {(
              [
                {
                  name: "basicPrice",
                  label: "Basic",
                  sublabel: "MP3 · Non-commercial",
                  icon: "🎧",
                  border: "border-white/15",
                  ring: "focus-within:border-white/30",
                  badge: "bg-white/10 text-slate-400",
                },
                {
                  name: "premiumPrice",
                  label: "Premium",
                  sublabel: "WAV + MP3 · Commercial",
                  icon: "⭐",
                  border: "border-brand-gold/30",
                  ring: "focus-within:border-brand-gold/60",
                  badge: "bg-brand-gold/20 text-brand-gold",
                },
                {
                  name: "exclusivePrice",
                  label: "Exclusif",
                  sublabel: "Tous formats · Droits exclusifs",
                  icon: "👑",
                  border: "border-purple-400/30",
                  ring: "focus-within:border-purple-400/60",
                  badge: "bg-purple-400/15 text-purple-400",
                },
              ] as const
            ).map(({ name, label, sublabel, icon, border, ring, badge }) => (
              <div
                key={name}
                className={`rounded-2xl border p-5 bg-white/[0.04] transition-all duration-200 hover:bg-white/[0.07] ${border} ${ring}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{icon}</span>
                  <span className="font-bold text-white text-sm">{label}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}
                  >
                    {sublabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-slate-400 font-bold">€</span>
                  <input
                    type="number"
                    name={name}
                    value={form[name as keyof FormState] as string}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-white text-xl font-black focus:outline-none placeholder-slate-700 w-full
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/25">
              <Search className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Le SEO améliore ta visibilité sur Google. Ces champs sont{" "}
                <span className="text-brand-gold font-semibold">
                  optionnels
                </span>{" "}
                mais recommandés.
              </p>
            </div>
            {(
              [
                [
                  "Titre SEO",
                  "seoTitle",
                  "seoTitle",
                  "Beat Trap Mélancolique 140 BPM – NomArtiste",
                  60,
                ],
                [
                  "Description SEO",
                  "seoDescription",
                  "seoDescription",
                  "Beat trap sombre avec piano mélancolique...",
                  160,
                ],
              ] as const
            ).map(([label, name, formKey, ph, max]) => (
              <div key={name}>
                <FieldLabel>{label}</FieldLabel>
                {name === "seoDescription" ? (
                  <Textarea
                    name={name}
                    value={form[formKey as keyof FormState] as string}
                    onChange={handleChange}
                    rows={3}
                    placeholder={ph}
                  />
                ) : (
                  <Input
                    name={name}
                    value={form[formKey as keyof FormState] as string}
                    onChange={handleChange}
                    placeholder={ph}
                  />
                )}
                <div className="flex justify-between mt-1.5">
                  <p className="text-[11px] text-slate-600">
                    {max} caractères max
                  </p>
                  <p
                    className={`text-[11px] font-semibold tabular-nums ${(form[formKey as keyof FormState] as string).length > max ? "text-red-400" : "text-slate-500"}`}
                  >
                    {(form[formKey as keyof FormState] as string).length}/{max}
                  </p>
                </div>
              </div>
            ))}
            <div>
              <FieldLabel>Mots-clés SEO</FieldLabel>
              <Input
                name="seoKeywords"
                value={form.seoKeywords}
                onChange={handleChange}
                placeholder="beat trap, instrumental, acheter beat rap..."
              />
            </div>
            <div className="mt-2 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                ✅ Récapitulatif avant publication
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {[
                  ["Titre", form.title || "—"],
                  ["BPM", form.bpm || "—"],
                  ["Tonalité", form.key || "—"],
                  ["Statut", "En attente (Pending)"],
                  ["Genres", form.genres.join(", ") || "—"],
                  ["Basic", form.basicPrice ? `${form.basicPrice}€` : "—"],
                  [
                    "Premium",
                    form.premiumPrice ? `${form.premiumPrice}€` : "—",
                  ],
                  [
                    "Exclusif",
                    form.exclusivePrice ? `${form.exclusivePrice}€` : "—",
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 min-w-0">
                    <span className="text-slate-600 shrink-0 w-16">{k}</span>
                    <span className="text-white/80 truncate font-medium">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-premium">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-[560px] px-4">
          <div className="text-center pt-10 mb-10">
            <h1 className="text-gradient text-4xl font-black font-display tracking-tight leading-tight">
              Ajouter un Beat
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Complète les 5 étapes pour publier ton beat
            </p>
          </div>

          <div className="mb-8">
            <div className="relative h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-brand-gold to-yellow-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToStep(s.id)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-200 ${
                        done
                          ? `bg-gradient-to-br ${s.color} border-transparent shadow-lg`
                          : active
                            ? "bg-white/10 border-brand-gold shadow-[0_0_0_3px_rgba(212,175,55,0.15)]"
                            : "bg-white/[0.04] border-white/12 group-hover:border-white/25 group-hover:bg-white/8"
                      }`}
                    >
                      {done ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${active ? "text-brand-gold" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                      )}
                      {active && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-gold" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? "text-brand-gold" : done ? "text-white/60" : "text-slate-600 group-hover:text-slate-400"}`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form
            noValidate
            onKeyDown={(e) => {
              if (e.key === "Enter" && stepRef.current !== STEPS.length) {
                e.preventDefault();
              }
            }}
          >
            <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className={`bg-gradient-to-r ${currentStep.color} p-px`}>
                <div className="bg-[rgba(15,15,20,0.95)] rounded-t-3xl px-6 py-4 flex items-center gap-3">
                  {(() => {
                    const Icon = currentStep.icon;
                    return <Icon className="w-4 h-4 text-white/80" />;
                  })()}
                  <h2 className="text-sm font-bold text-white">
                    {
                      [
                        "Informations de base",
                        "Médias & Fichiers",
                        "Genres, Moods & Tags",
                        "Tarification",
                        "SEO & Publication",
                      ][step - 1]
                    }
                  </h2>
                  <span className="ml-auto text-[10px] text-white/30 font-mono">
                    {step}/{STEPS.length}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm flex items-start gap-2">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-300 text-sm flex items-start gap-2">
                    <span>✅</span>
                    {success}
                  </div>
                )}
                {renderStep()}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 text-slate-400 text-sm font-semibold
                    hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
              )}
              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => goToStep(step + 1)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-gold text-slate-900 text-sm font-black
                    hover:brightness-110 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
                >
                  Étape suivante <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="submit-final"
                  type="button"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-gold text-slate-900 text-sm font-black
                    hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />{" "}
                      Publication...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Publier le Beat
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
