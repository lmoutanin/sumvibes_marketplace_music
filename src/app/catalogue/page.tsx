"use client";
const INSTRUMENTS = [
  "Piano",
  "Guitar",
  "Synth",
  "Drums",
  "Bass",
  "Strings",
  "Brass",
];

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import {
  Music,
  Play,
  Pause,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Heart,
  ShoppingCart,
  ChevronDown,
  Clock,
  X,
  Check,
  Zap,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useBeats } from "@/hooks/useBeats";

// ─── Constantes ───────────────────────────────────────────────────────────────

const GENRES = [
  "Tous",
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
  "Tous",
  "Dark",
  "Chill",
  "Uplifting",
  "Energetic",
  "Romantic",
  "Aggressive",
  "Melancholic",
];
const BPM_RANGES = [
  { label: "Tous les BPM", min: undefined, max: undefined },
  { label: "< 80 BPM", min: 0, max: 80 },
  { label: "80 – 100", min: 80, max: 100 },
  { label: "100 – 120", min: 100, max: 120 },
  { label: "120 – 140", min: 120, max: 140 },
  { label: "> 140 BPM", min: 140, max: 999 },
];

const GENRE_GRADIENT: Record<string, string> = {
  Trap: "from-red-500/40 to-orange-600/25",
  "Hip-Hop": "from-blue-500/40 to-cyan-600/25",
  "R&B": "from-purple-500/40 to-pink-600/25",
  Afrobeat: "from-green-500/40 to-emerald-600/25",
  Drill: "from-slate-400/40 to-zinc-600/25",
  Pop: "from-yellow-400/40 to-amber-600/25",
  Reggaeton: "from-lime-500/40 to-green-600/25",
  "Lo-Fi": "from-indigo-500/40 to-violet-600/25",
  "Boom Bap": "from-orange-500/40 to-red-600/25",
};

const GENRE_EMOJI: Record<string, string> = {
  Trap: "🔥",
  "Hip-Hop": "🎤",
  "R&B": "💜",
  Afrobeat: "🌍",
  Drill: "⚡",
  Pop: "🌟",
  Reggaeton: "🌴",
  "Lo-Fi": "🌙",
  "Boom Bap": "🥁",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(secs?: number | null) {
  if (!secs || isNaN(secs) || !isFinite(secs)) return "0:00";
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
}

function coverSrc(raw: string) {
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/covers/${raw}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CataloguePage() {
  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tous");
  const [selectedMood, setSelectedMood] = useState("Tous");
  const [selectedBpm, setSelectedBpm] = useState(BPM_RANGES[0]);
  const [selectedInstrument, setSelectedInstrument] = useState("Tous");
  const [sortBy, setSortBy] = useState<
    "latest" | "popular" | "price_low" | "price_high"
  >("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (id: string) => {
    if (activeBeatId === id) {
      if (isPlayingAudio) {
        audioRef.current?.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current?.play();
        setIsPlayingAudio(true);
      }
    } else {
      const beat = allBeats.find((b) => b.id === id);
      const url = beat?.previewUrl || beat?.audioUrl || beat?.mainFileUrl;
      if (!url) {
        alert("Aperçu audio non disponible.");
        return;
      }
      if (audioRef.current) {
        setIsBuffering(true);
        audioRef.current.src = url;
        audioRef.current.play().then(() => {
          setIsBuffering(false);
        }).catch(() => {
          setIsBuffering(false);
        });
        setActiveBeatId(id);
        setIsPlayingAudio(true);
      }
    }
  };



  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const updateProgress = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.pause();
    };
  }, [volume, isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = (id: string) =>
    setLikedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Nombre de filtres actifs (hors search + sort)
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedGenre !== "Tous") n++;
    if (selectedMood !== "Tous") n++;
    if (selectedBpm.min !== undefined) n++;
    if (selectedInstrument !== "Tous") n++;
    return n;
  }, [selectedGenre, selectedMood, selectedBpm, selectedInstrument]);

  const resetFilters = () => {
    setSelectedGenre("Tous");
    setSelectedMood("Tous");
    setSelectedBpm(BPM_RANGES[0]);
    setSelectedInstrument("Tous");
    setSearchQuery("");
  };

  // Charge TOUS les beats une seule fois — le filtrage se fait entièrement côté client
  const { beats: allBeats, loading } = useBeats({});

  const activeBeat = useMemo(() => {
    return allBeats.find((b) => b.id === activeBeatId);
  }, [allBeats, activeBeatId]);

  // ── Filtrage + tri 100% client ─────────────────────────────────────────────
  const { beats, total } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let result = allBeats.filter((beat) => {
      // Recherche : titre ET artiste/username du vendeur
      if (q) {
        const inTitle = beat.title?.toLowerCase().includes(q);
        const inDesc = beat.description?.toLowerCase().includes(q);
        const inDisplay = beat.seller?.displayName?.toLowerCase().includes(q);
        const inUsername = beat.seller?.username?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inDisplay && !inUsername) return false;
      }

      // Genre
      if (selectedGenre !== "Tous" && !beat.genre?.includes(selectedGenre))
        return false;

      // Mood
      if (selectedMood !== "Tous" && !beat.mood?.includes(selectedMood))
        return false;

      // BPM
      if (selectedBpm.min !== undefined && (beat.bpm ?? 0) < selectedBpm.min)
        return false;
      if (selectedBpm.max !== undefined && (beat.bpm ?? 0) > selectedBpm.max)
        return false;

      // Instrument
      if (
        selectedInstrument !== "Tous" &&
        !(
          Array.isArray(beat.instruments) &&
          beat.instruments.includes(selectedInstrument)
        )
      )
        return false;

      return true;
    });

    // Tri
    result = [...result].sort((a, b) => {
      if (sortBy === "popular") return (b.plays ?? 0) - (a.plays ?? 0);
      if (sortBy === "price_low")
        return Number(a.basicPrice ?? 0) - Number(b.basicPrice ?? 0);
      if (sortBy === "price_high")
        return Number(b.basicPrice ?? 0) - Number(a.basicPrice ?? 0);
      // latest (défaut)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { beats: result, total: result.length };
  }, [
    allBeats,
    searchQuery,
    selectedGenre,
    selectedMood,
    selectedBpm,
    selectedInstrument,
    sortBy,
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <audio ref={audioRef} className="hidden" />

      <main className="pt-20">
        {/* ── Header (inchangé) ─────────────────────────────────────────── */}
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Catalogue <span className="text-gradient">Musical</span> 🎶
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Explorez des milliers de productions premium. Filtrez par genre,
              BPM et ambiance.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/catalogue/style"
                className="glass px-4 py-2 rounded-full text-sm hover:bg-white/10"
              >
                Par Style
              </Link>
              <Link
                href="/catalogue/bpm"
                className="glass px-4 py-2 rounded-full text-sm hover:bg-white/10"
              >
                Par BPM
              </Link>
              <Link
                href="/catalogue/filters/ambiance"
                className="glass px-4 py-2 rounded-full text-sm hover:bg-white/10"
              >
                Par Ambiance
              </Link>
            </div>
          </div>
        </section>

        {/* ── Barre de filtres ──────────────────────────────────────────── */}
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center">
              {/* Recherche — titre ET artiste */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titre, producteur, artiste..."
                  className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`glass px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 lg:hidden relative ${activeFilterCount > 0 ? "border border-brand-gold/40 text-brand-gold" : ""}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Selects desktop */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Genre */}
                <SelectFilter
                  value={selectedGenre}
                  onChange={setSelectedGenre}
                  options={GENRES}
                  active={selectedGenre !== "Tous"}
                />

                {/* Ambiance */}
                <SelectFilter
                  value={selectedMood}
                  onChange={setSelectedMood}
                  options={MOODS}
                  active={selectedMood !== "Tous"}
                />

                {/* Instrument */}
                <SelectFilter
                  value={selectedInstrument}
                  onChange={setSelectedInstrument}
                  options={["Tous", ...INSTRUMENTS]}
                  active={selectedInstrument !== "Tous"}
                />

                {/* BPM */}
                <SelectFilter
                  value={selectedBpm.label}
                  onChange={(label) =>
                    setSelectedBpm(
                      BPM_RANGES.find((r) => r.label === label) ??
                        BPM_RANGES[0],
                    )
                  }
                  options={BPM_RANGES.map((r) => r.label)}
                  active={selectedBpm.min !== undefined}
                />

                {/* Tri */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-brand-gold/50 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "#fff",
                    }}
                  >
                    <option value="latest" className="bg-brand-dark">
                      Plus récents
                    </option>
                    <option value="popular" className="bg-brand-dark">
                      Populaires
                    </option>
                    <option value="price_low" className="bg-brand-dark">
                      Prix ↑
                    </option>
                    <option value="price_high" className="bg-brand-dark">
                      Prix ↓
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>

                {/* Reset si filtres actifs */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-slate-400 text-xs font-semibold hover:border-red-400/50 hover:text-red-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Réinitialiser
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="hidden lg:flex items-center gap-1 glass rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-brand-gold/20 text-brand-gold" : "text-slate-400 hover:text-white"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-brand-gold/20 text-brand-gold" : "text-slate-400 hover:text-white"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filtres actifs pills */}
            {(activeFilterCount > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
                <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                  Filtres actifs :
                </span>
                {searchQuery && (
                  <ActivePill
                    label={`"${searchQuery}"`}
                    onRemove={() => setSearchQuery("")}
                    color="blue"
                  />
                )}
                {selectedGenre !== "Tous" && (
                  <ActivePill
                    label={`${GENRE_EMOJI[selectedGenre] ?? ""} ${selectedGenre}`}
                    onRemove={() => setSelectedGenre("Tous")}
                    color="gold"
                  />
                )}
                {selectedMood !== "Tous" && (
                  <ActivePill
                    label={selectedMood}
                    onRemove={() => setSelectedMood("Tous")}
                    color="violet"
                  />
                )}
                {selectedBpm.min !== undefined && (
                  <ActivePill
                    label={`⚡ ${selectedBpm.label}`}
                    onRemove={() => setSelectedBpm(BPM_RANGES[0])}
                    color="emerald"
                  />
                )}
                {selectedInstrument !== "Tous" && (
                  <ActivePill
                    label={selectedInstrument}
                    onRemove={() => setSelectedInstrument("Tous")}
                    color="blue"
                  />
                )}
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-slate-600 hover:text-red-400 transition-colors ml-1 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Tout effacer
                </button>
              </div>
            )}

            {/* Filtres mobile panel */}
            {showFilters && (
              <div className="glass rounded-2xl p-6 mt-4 space-y-5 lg:hidden">
                {/* Genre chips */}
                <div>
                  <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                    Genre
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGenre(g)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          selectedGenre === g
                            ? "bg-brand-gold border-brand-gold text-slate-900"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {g !== "Tous" && GENRE_EMOJI[g]} {g}
                        {selectedGenre === g && g !== "Tous" && (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood chips */}
                <div>
                  <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                    Ambiance
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMood(m)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          selectedMood === m
                            ? "bg-brand-gold border-brand-gold text-slate-900"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {m}
                        {selectedMood === m && m !== "Tous" && (
                          <Check className="w-3 h-3 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instrument chips */}
                <div>
                  <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                    Instrument
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Tous", ...INSTRUMENTS].map((i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedInstrument(i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          selectedInstrument === i
                            ? "bg-brand-gold border-brand-gold text-slate-900"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {i}
                        {selectedInstrument === i && i !== "Tous" && (
                          <Check className="w-3 h-3 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BPM chips */}
                <div>
                  <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                    BPM
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BPM_RANGES.map((r) => (
                      <button
                        key={r.label}
                        onClick={() => setSelectedBpm(r)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          selectedBpm.label === r.label
                            ? "bg-brand-gold border-brand-gold text-slate-900"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        <Zap className="w-3 h-3" /> {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort + reset */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as typeof sortBy)
                      }
                      className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-9 text-white text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="latest" className="bg-brand-dark">
                        Plus récents
                      </option>
                      <option value="popular" className="bg-brand-dark">
                        Populaires
                      </option>
                      <option value="price_low" className="bg-brand-dark">
                        Prix ↑
                      </option>
                      <option value="price_high" className="bg-brand-dark">
                        Prix ↓
                      </option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Réinitialiser
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Résultats ─────────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm">
                {loading
                  ? "Chargement..."
                  : `${typeof total === "number" ? total : 0} résultat${(typeof total === "number" ? total : 0) !== 1 ? "s" : ""}`}
                {searchQuery && !loading && (
                  <span className="text-slate-600 ml-1">
                    pour <span className="text-white/70">"{searchQuery}"</span>
                  </span>
                )}
              </p>
            </div>

            {/* Skeletons */}
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "space-y-3"
                }
              >
                {[...Array(8)].map((_, i) =>
                  viewMode === "grid" ? (
                    <div
                      key={i}
                      className="glass rounded-2xl p-6 animate-pulse"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.06] mx-auto mb-4" />
                      <div className="h-4 bg-white/[0.06] rounded w-3/4 mx-auto mb-2" />
                      <div className="h-3 bg-white/[0.04] rounded w-1/2 mx-auto" />
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="glass rounded-xl p-4 flex items-center gap-4 animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/[0.06] shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-white/[0.06] rounded w-1/3" />
                        <div className="h-2.5 bg-white/[0.04] rounded w-1/5" />
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : beats.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-xl text-slate-400">Aucun beat trouvé</p>
                <p className="text-sm text-slate-500 mt-2">
                  {searchQuery
                    ? `Aucun résultat pour "${searchQuery}" — essayez un autre nom ou titre`
                    : "Essayez de modifier vos filtres"}
                </p>
                {(activeFilterCount > 0 || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-brand-gold text-slate-900 text-sm font-black hover:brightness-110 transition-all"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* ── Vue Grille (inchangée) ── */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {beats.map((beat) => {
                  const genre0 = beat.genre?.[0] ?? "";
                  const mood0 = beat.mood?.[0] ?? "";
                  const gradient =
                    GENRE_GRADIENT[genre0] ??
                    "from-brand-purple/30 to-brand-pink/25";
                  const emoji = GENRE_EMOJI[genre0] ?? "🎵";
                  const isLiked = likedIds.has(beat.id);
                  const isActive = activeBeatId === beat.id;
                  const isPlaying = isActive && isPlayingAudio;
                  const duration = formatDuration(beat.duration);

                  return (
                    <div
                      key={beat.id}
                      className={`glass group rounded-2xl p-6 text-center hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 transition-all duration-200 relative ${
                        isActive
                          ? "ring-2 ring-brand-gold/50 bg-brand-gold/5"
                          : ""
                      }`}
                    >
                      <button
                        onClick={() => toggleLike(beat.id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
                          isLiked
                            ? "text-rose-400 opacity-100"
                            : "text-slate-600 opacity-0 group-hover:opacity-100 hover:text-rose-400"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                        />
                      </button>

                      <div
                        className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 relative overflow-hidden`}
                      >
                        {beat.coverImage ? (
                          <Image
                            src={coverSrc(beat.coverImage)}
                            alt={beat.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-3xl">{emoji}</span>
                        )}
                        {isPlaying && (
                          <div className="absolute inset-0 bg-black/55 flex items-end justify-center gap-[3px] pb-1.5">
                            {[0.1, 0.22, 0.14].map((d, i) => (
                              <span
                                key={i}
                                className="w-[3px] bg-brand-gold rounded-sm"
                                style={{
                                  height: "50%",
                                  animation: `eqBar 0.55s ease-in-out ${d}s infinite alternate`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <h3
                        className={`font-bold text-lg leading-tight mb-0.5 line-clamp-1 transition-colors ${isPlaying ? "text-brand-gold" : "group-hover:text-brand-gold"}`}
                      >
                        {beat.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-1">
                        {beat.seller?.displayName || beat.seller?.username}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-4 flex-wrap">
                        {beat.bpm && <span>{beat.bpm} BPM</span>}
                        {beat.key && (
                          <>
                            <span className="text-slate-700">·</span>
                            <span>{beat.key}</span>
                          </>
                        )}
                        {duration && (
                          <>
                            <span className="text-slate-700">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {duration}
                            </span>
                          </>
                        )}
                        {mood0 && (
                          <>
                            <span className="text-slate-700">·</span>
                            <span>{mood0}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-brand-gold font-bold text-sm">
                          {Number(beat.basicPrice ?? 0).toFixed(2)}€
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePlay(beat.id)}
                            className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center hover:bg-brand-gold/20 transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-brand-gold fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-brand-gold fill-current ml-0.5" />
                            )}
                          </button>
                          <button className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <ShoppingCart className="w-3.5 h-3.5" /> Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── Vue Liste (inchangée) ── */
              <div className="space-y-3">
                {beats.map((beat) => {
                  const genre0 = beat.genre?.[0] ?? "";
                  const isActive = activeBeatId === beat.id;
                  const isPlaying = isActive && isPlayingAudio;
                  const isLiked = likedIds.has(beat.id);
                  const duration = formatDuration(beat.duration);

                  return (
                    <div
                      key={beat.id}
                      className={`glass rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/5 ${
                        isActive
                          ? "ring-1 ring-brand-gold/40 bg-brand-gold/5"
                          : ""
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 relative">
                        {beat.coverImage ? (
                          <Image
                            src={coverSrc(beat.coverImage)}
                            alt={beat.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-white/30 absolute inset-0 m-auto" />
                        )}
                      </div>

                      <button
                        onClick={() => togglePlay(beat.id)}
                        className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center hover:bg-brand-gold/20 transition-colors flex-shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-brand-gold fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-brand-gold ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${beat.slug}`}
                          className={`font-bold text-sm block truncate transition-colors ${isPlaying ? "text-brand-gold" : "hover:text-brand-gold"}`}
                        >
                          {beat.title}
                        </Link>
                        <p className="text-xs text-slate-400 truncate">
                          {beat.seller?.displayName || beat.seller?.username}
                        </p>
                      </div>

                      <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 flex-shrink-0">
                        {beat.bpm && <span>{beat.bpm} BPM</span>}
                        {beat.key && <span>{beat.key}</span>}
                        {duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {duration}
                          </span>
                        )}
                        {genre0 && <span>{genre0}</span>}
                      </div>

                      <button
                        onClick={() => toggleLike(beat.id)}
                        className={`glass p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ${isLiked ? "text-rose-400" : ""}`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                        />
                      </button>

                      <div className="text-brand-gold font-bold text-sm flex-shrink-0">
                        {Number(beat.basicPrice ?? 0).toFixed(2)}€
                      </div>

                      <button className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0">
                        <ShoppingCart className="w-4 h-4" /> Ajouter
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">
          © 2026 SUMVIBES by SAS BE GREAT. Tous droits réservés.
        </div>
      </footer>

      <style>{`
        @keyframes eqBar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      {/* ── Player flottant type Spotify ── */}
      {activeBeat && (
        <div className="fixed bottom-0 left-0 right-0 glass z-50 border-t border-brand-gold/10 backdrop-blur-xl bg-[#0a0a0f]/95 animate-in slide-in-from-bottom-5">
          <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between h-20">
            {/* Ligne 1 : Artiste et infos */}
            <div className="flex items-center gap-3 w-1/3 min-w-[200px]">
              <div className="w-14 h-14 rounded-md bg-white/5 overflow-hidden relative flex-shrink-0 shadow-lg group">
                {activeBeat.coverImage ? (
                  <Image src={coverSrc(activeBeat.coverImage)} alt="cover" fill sizes="56px" className="object-cover" />
                ) : (
                  <Music className="w-6 h-6 m-auto absolute inset-0 text-white/30" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-5 h-5 text-white" onClick={() => { audioRef.current?.pause(); setActiveBeatId(null); setIsPlayingAudio(false); }} />
                </div>
              </div>
              <div className="min-w-0">
                <Link href={`/product/${activeBeat.slug}`} className="font-bold text-sm truncate hover:underline hover:text-brand-gold">{activeBeat.title}</Link>
                <Link href={`/producers/${activeBeat.seller.id}`} className="block text-xs text-slate-400 hover:text-white hover:underline truncate mt-0.5">
                  {activeBeat.seller?.displayName || activeBeat.seller?.username}
                </Link>
              </div>
              <button
                onClick={() => toggleLike(activeBeat.id)}
                className={`ml-2 p-1.5 rounded-lg transition-colors flex-shrink-0 ${likedIds.has(activeBeat.id) ? "text-rose-400" : "text-slate-500 hover:text-white"}`}
              >
                <Heart className={`w-4 h-4 ${likedIds.has(activeBeat.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Ligne 2 : Contrôles de lecture & Barre de progression */}
            <div className="flex flex-col items-center justify-center gap-1.5 w-1/3 max-w-[600px]">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => togglePlay(activeBeat.id)}
                  className="w-8 h-8 rounded-full bg-white hover:scale-105 text-black flex items-center justify-center transition-transform"
                >
                  {isBuffering ? (
                    <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" />
                  ) : isPlayingAudio ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Barre de progression avec temps */}
              <div className="flex items-center gap-3 w-full text-[11px] text-slate-400 font-medium">
                <span className="w-8 text-right">{formatDuration(currentTime) || "0:00"}</span>
                <div className="relative flex-1 h-1 bg-white/10 rounded-full group flex items-center cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="h-full bg-white group-hover:bg-brand-gold transition-colors rounded-full"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                  </div>
                </div>
                <span className="w-8 text-left">{formatDuration(duration) || "0:00"}</span>
              </div>
            </div>

            <div className="w-[30%] min-w-[200px] flex justify-end gap-6 items-center">
              <div className="flex items-center gap-2 group w-32">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="relative flex-1 h-1.5 bg-white/10 rounded-full flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="h-full bg-slate-300 group-hover:bg-brand-gold transition-colors rounded-full"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="h-6 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-brand-gold hidden sm:block">
                  {Number(activeBeat.basicPrice ?? 0).toFixed(2)}€
                </div>
                <button className="btn-primary p-2 rounded-lg text-xs font-semibold flex items-center justify-center hover:scale-105 transition-transform">
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Composants locaux ────────────────────────────────────────────────────────

function SelectFilter({
  value,
  onChange,
  options,
  active,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  active: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none cursor-pointer transition-all border ${
          active
            ? "bg-brand-gold/15 border-brand-gold/50 text-brand-gold"
            : "bg-white/5 border-white/10 focus:border-brand-gold/50"
        }`}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0d0d12] text-white">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${active ? "text-brand-gold" : "text-slate-500"}`}
      />
    </div>
  );
}

function ActivePill({
  label,
  onRemove,
  color,
}: {
  label: string;
  onRemove: () => void;
  color: "gold" | "violet" | "emerald" | "blue";
}) {
  const colors = {
    gold: "bg-brand-gold/15 border-brand-gold/30 text-brand-gold",
    violet: "bg-violet-400/15 border-violet-400/30 text-violet-300",
    emerald: "bg-emerald-400/15 border-emerald-400/30 text-emerald-300",
    blue: "bg-blue-400/15 border-blue-400/30 text-blue-300",
  };
  return (
    <button
      onClick={onRemove}
      className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all hover:opacity-75 ${colors[color]}`}
    >
      {label} <X className="w-3 h-3" />
    </button>
  );
}
