"use client";

import { useState, useRef, FormEvent } from "react";
import { X, Upload, Music, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";

interface BeatUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BeatUploadModal({ isOpen, onClose, onSuccess }: BeatUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'success'>('form');
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const stemsRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    mood: '',
    bpm: '',
    key: '',
    price: '',
    description: '',
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
    setStep('uploading');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      // Upload files first
      let audioUrl = '';
      let coverUrl = '';
      let stemsUrls: string[] = [];

      // Upload audio file
      if (files.audio) {
        setProgress(20);
        const audioFormData = new FormData();
        audioFormData.append('file', files.audio);
        audioFormData.append('type', 'audio');
        const audioRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: audioFormData,
        });
        const audioData = await audioRes.json();
        if (audioRes.ok) audioUrl = audioData.url;
        else throw new Error(audioData.error || 'Erreur upload audio');
      }

      // Upload cover image
      if (files.cover) {
        setProgress(40);
        const coverFormData = new FormData();
        coverFormData.append('file', files.cover);
        coverFormData.append('type', 'cover');
        const coverRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: coverFormData,
        });
        const coverData = await coverRes.json();
        if (coverRes.ok) coverUrl = coverData.url;
        else throw new Error(coverData.error || 'Erreur upload cover');
      }

      // Upload stems
      if (files.stems && files.stems.length > 0) {
        setProgress(60);
        for (let i = 0; i < files.stems.length; i++) {
          const stemFormData = new FormData();
          stemFormData.append('file', files.stems[i]);
          stemFormData.append('type', 'stems');
          const stemRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: stemFormData,
          });
          const stemData = await stemRes.json();
          if (stemRes.ok) stemsUrls.push(stemData.url);
        }
      }

      // Create beat
      setProgress(80);
      const beatData = {
        title: formData.title,
        genre: formData.genre,
        mood: formData.mood,
        bpm: parseInt(formData.bpm),
        key: formData.key,
        basicPrice: parseFloat(formData.price),
        description: formData.description,
        previewUrl: audioUrl,
        mainFileUrl: audioUrl,
        coverImage: coverUrl,
        stemsUrls,
      };

      const res = await fetch('/api/beats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(beatData),
      });

      if (res.ok) {
        setProgress(100);
        setStep('success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        throw new Error('Erreur lors de la création du beat');
      }
    } catch (error) {
      console.error('Error uploading beat:', error);
      alert('Erreur lors de l\'upload. Veuillez réessayer.');
      setStep('form');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      genre: '',
      mood: '',
      bpm: '',
      key: '',
      price: '',
      description: '',
    });
    setFiles({ audio: null, cover: null, stems: null });
    setStep('form');
    setProgress(0);
    onClose();
  };

  if (step === 'uploading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-16 h-16 text-brand-gold mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Upload en cours...</h3>
          <p className="text-slate-400 mb-4">Ne fermez pas cette fenêtre</p>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-brand-gold h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-brand-gold font-semibold mt-2">{progress}%</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold"
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
              placeholder="Décrivez votre beat..."
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Fichier audio * (MP3, WAV)</label>
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
                className="w-full glass p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <Music className="w-5 h-5" />
                {files.audio ? files.audio.name : 'Sélectionner le fichier audio'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Image de couverture (JPG, PNG)</label>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFiles({ ...files, cover: e.target.files?.[0] || null })}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="w-full glass p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <ImageIcon className="w-5 h-5" />
                {files.cover ? files.cover.name : 'Sélectionner une image'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Stems (optionnel, plusieurs fichiers)</label>
              <input
                ref={stemsRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => setFiles({ ...files, stems: e.target.files })}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => stemsRef.current?.click()}
                className="w-full glass p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <Upload className="w-5 h-5" />
                {files.stems ? `${files.stems.length} fichier(s) sélectionné(s)` : 'Sélectionner les stems'}
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
              {uploading ? 'Upload...' : 'Publier le beat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
