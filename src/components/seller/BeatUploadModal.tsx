"use client";

import { useState, useRef, FormEvent } from "react";
import { X, Upload, Music, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";

interface BeatUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Helper: upload via presigned URL with real progress ──────────────────────

async function uploadToR2(
  file: File,
  category: "audio" | "cover" | "stems" | "avatar",
  token: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  // 1. Get presigned URL from our API
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

  // 2. Upload the file directly to R2 via XHR (supports progress events)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload R2 échoué : HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Erreur réseau lors de l'upload"));
    xhr.send(file);
  });

  return key;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BeatUploadModal({ isOpen, onClose, onSuccess }: BeatUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"form" | "uploading" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const stemsRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    mood: "",
    bpm: "",
    key: "",
    price: "",
    description: "",
  });

  const [files, setFiles] = useState<{
    audio: File | null;
    cover: File | null;
    stems: FileList | null;
  }>({
    audio: null,
    cover: null,
    stems: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStep("uploading");
    setProgress(0);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      let audioKey = "";
      let coverKey = "";
      let stemsKeys: string[] = [];

      // ── 1. Upload audio file ───────────────────────────────────────────────
      if (files.audio) {
        setProgressLabel("Upload de l'audio…");
        audioKey = await uploadToR2(files.audio, "audio", token, (pct) => {
          setProgress(Math.round(pct * 0.5)); // 0–50%
        });
        setProgress(50);
      }

      // ── 2. Upload cover image ──────────────────────────────────────────────
      if (files.cover) {
        setProgressLabel("Upload de la cover…");
        coverKey = await uploadToR2(files.cover, "cover", token, (pct) => {
          setProgress(50 + Math.round(pct * 0.2)); // 50–70%
        });
        setProgress(70);
      }

      // ── 3. Upload stems (ZIP) ──────────────────────────────────────────────
      if (files.stems && files.stems.length > 0) {
        setProgressLabel("Upload des stems…");
        for (let i = 0; i < files.stems.length; i++) {
          const stemKey = await uploadToR2(files.stems[i], "stems", token, (pct) => {
            const base = 70 + Math.round((i / files.stems!.length) * 10);
            setProgress(base + Math.round((pct / files.stems!.length) * 10));
          });
          stemsKeys.push(stemKey);
        }
        setProgress(80);
      }

      // ── 4. Create beat record with R2 keys ────────────────────────────────
      setProgressLabel("Création du beat…");
      const beatFormData = new FormData();
      beatFormData.append("title", formData.title);
      beatFormData.append("genres", formData.genre); // Backend handles plural
      beatFormData.append("moods", formData.mood);   // Backend handles plural
      beatFormData.append("bpm", formData.bpm);
      beatFormData.append("key", formData.key);
      beatFormData.append("basicPrice", formData.price);
      beatFormData.append("description", formData.description || "Pas de description.");
      beatFormData.append("duration", "180"); // default
      beatFormData.append("instruments", "Drums, Bass, Synth"); // Default valid instruments string

      if (audioKey) beatFormData.append("mp3Key", audioKey);
      if (coverKey) beatFormData.append("coverKey", coverKey);

      // If stems were uploaded, they are considered WAV/Trackout in this context
      if (stemsKeys.length > 0) {
        beatFormData.append("wavKey", stemsKeys[0]); // First file as WAV
        beatFormData.append("premiumPrice", (parseFloat(formData.price) * 2).toString()); // Placeholder price

        if (stemsKeys.length > 1) {
          beatFormData.append("trackoutKey", stemsKeys[1]); // Second file as Trackout
          beatFormData.append("exclusivePrice", (parseFloat(formData.price) * 5).toString()); // Placeholder price
        }
      }

      const res = await fetch("/api/beats", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: beatFormData,
      });

      if (res.ok) {
        setProgress(100);
        setProgressLabel("Beat publié !");
        setStep("success");
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la création du beat");
      }
    } catch (error: any) {
      console.error("Error uploading beat:", error);
      alert(error?.message || "Erreur lors de l'upload. Veuillez réessayer.");
      setStep("form");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      genre: "",
      mood: "",
      bpm: "",
      key: "",
      price: "",
      description: "",
    });
    setFiles({ audio: null, cover: null, stems: null });
    setStep("form");
    setProgress(0);
    setProgressLabel("");
    onClose();
  };

  if (step === "uploading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-16 h-16 text-brand-gold mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Upload en cours…</h3>
          <p className="text-slate-400 mb-1">{progressLabel}</p>
          <p className="text-slate-500 text-sm mb-4">Ne fermez pas cette fenêtre</p>

          {/* Barre de progression */}
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-brand-gold to-brand-gold/70 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-brand-gold font-semibold text-lg">{progress}%</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Beat uploadé !</h3>
          <p className="text-slate-400">Votre beat sera visible après validation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upload un beat</h2>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Titre du beat *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold"
              placeholder="Ex: Dark Shadows"
            />
          </div>

          {/* Genre & Mood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Genre *</label>
              <select
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full text-white focus:outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="Trap">Trap</option>
                <option value="Drill">Drill</option>
                <option value="R&B">R&B</option>
                <option value="Afrobeat">Afrobeat</option>
                <option value="Soul">Soul</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Pop">Pop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Mood *</label>
              <select
                required
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full text-white focus:outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="Sombre">Sombre</option>
                <option value="Énergique">Énergique</option>
                <option value="Mélancolique">Mélancolique</option>
                <option value="Joyeux">Joyeux</option>
                <option value="Romantique">Romantique</option>
                <option value="Agressif">Agressif</option>
              </select>
            </div>
          </div>

          {/* BPM & Key */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">BPM *</label>
              <input
                type="number"
                required
                min="60"
                max="200"
                value={formData.bpm}
                onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold"
                placeholder="Ex: 140"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Tonalité *</label>
              <input
                type="text"
                required
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold"
                placeholder="Ex: Cm, Am, G#"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-2">Prix (€) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold"
              placeholder="Ex: 29.99"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold resize-none"
              placeholder="Décrivez votre beat…"
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            {/* Audio */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Fichier audio * (MP3, WAV)
              </label>
              <input
                ref={audioRef}
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setFiles({ ...files, audio: e.target.files?.[0] || null })}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => audioRef.current?.click()}
                className="w-full glass p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Music className="w-5 h-5 text-brand-gold" />
                <span className={files.audio ? "text-green-400" : ""}>
                  {files.audio
                    ? `✓ ${files.audio.name} (${(files.audio.size / 1024 / 1024).toFixed(1)} Mo)`
                    : "Sélectionner le fichier audio"}
                </span>
              </button>
            </div>

            {/* Cover */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Image de couverture (JPG, PNG)
              </label>
              <input
                ref={coverRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => setFiles({ ...files, cover: e.target.files?.[0] || null })}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="w-full glass p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-brand-gold" />
                <span className={files.cover ? "text-green-400" : ""}>
                  {files.cover
                    ? `✓ ${files.cover.name}`
                    : "Sélectionner une image"}
                </span>
              </button>
            </div>

            {/* Stems */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Stems (optionnel, ZIP)
              </label>
              <input
                ref={stemsRef}
                type="file"
                accept="application/zip,application/x-zip-compressed"
                multiple
                onChange={(e) => setFiles({ ...files, stems: e.target.files })}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => stemsRef.current?.click()}
                className="w-full glass p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Upload className="w-5 h-5 text-brand-gold" />
                <span className={files.stems && files.stems.length > 0 ? "text-green-400" : ""}>
                  {files.stems && files.stems.length > 0
                    ? `✓ ${files.stems.length} fichier(s) sélectionné(s)`
                    : "Sélectionner les stems"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-white/10"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {uploading ? "Upload…" : "Publier le beat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
