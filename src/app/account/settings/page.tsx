"use client";

import { useState, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
  Music,
  MapPin,
  Loader2,
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Camera,
  Globe,
  Mail,
  ChevronLeft,
  Phone,
  Home,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

// (Dynamic tabs will be created inside the component based on user role)
const baseTabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "security", label: "Sécurité", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Préférences", icon: Music },
];

// Liste centralisée des genres musicaux
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

export default function SettingsPage() {
  const { user, token, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarPreview(data.url);
        await refreshUser();
      } else {
        setError(data.error || "Erreur lors de l'upload");
      }
    } catch {
      setError("Erreur réseau lors de l'upload");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const tabs = baseTabs;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      displayName: formData.get("displayName") as string,
      email: formData.get("email") as string,
      bio: formData.get("bio") as string,
      website: formData.get("website") as string,
      phone: formData.get("phone") as string,
      instagram: formData.get("instagram") as string,
      twitter: formData.get("twitter") as string,
      youtube: formData.get("youtube") as string,
      country: formData.get("country") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
    };

    if (user?.role === "SELLER") {
      data.artistName = formData.get("displayName") as string;
      data.description = formData.get("bio") as string;
      data.genres = formData.getAll("genres") as string[];
      data.paypalEmail = formData.get("paypalEmail") as string;
    }

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await refreshUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };



  const handlePreferencesSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const musicPrefs = {
      preferredGenres: formData.getAll("preferredGenres") as string[],
      preferredMoods: formData.getAll("preferredMoods") as string[],
      language: formData.get("language") as string,
    };

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ musicPrefs }),
      });

      if (res.ok) {
        await refreshUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSave = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const notificationPrefs = {
      newMessages: formData.get("newMessages") === "on",
      newBeats: formData.get("newBeats") === "on",
      promotions: formData.get("promotions") === "on",
      newsletter: formData.get("newsletter") === "on",
      forumReplies: formData.get("forumReplies") === "on",
      updates: formData.get("updates") === "on",
    };

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationPrefs }),
      });

      if (res.ok) {
        await refreshUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte définitivement ? Cette action est irréversible.",
      )
    ) {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          logout();
          router.push("/");
        } else {
          const errorData = await res.json();
          setError(
            errorData.error || "Une erreur est survenue lors de la suppression",
          );
          setLoading(false);
        }
      } catch (err) {
        setError("Erreur réseau ou serveur non joignable");
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6"
          >
            <ChevronLeft className="w-5 h-5" /> Retour au compte
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-8">
            Paramètres
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === tab.id
                  ? "bg-brand-gold text-brand-purple"
                  : "glass hover:bg-white/10"
                  }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Success */}
          {saved && (
            <div className="glass rounded-xl p-4 mb-6 border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-semibold">
              ✅ Modifications enregistrées avec succès !
            </div>
          )}

          {error && (
            <div className="glass rounded-xl p-4 mb-6 border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && user && (
            <form
              onSubmit={handleProfileSave}
              className="glass rounded-3xl p-8"
            >
              {/* EN-TÊTE DU FORMULAIRE */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                  <User className="w-6 h-6 text-brand-gold" /> Informations personnelles
                </h2>
              </div>

              {/* AVATAR */}
              <div className="flex items-center gap-6 mb-8 p-6 glass rounded-2xl">
                <div className="relative">
                  <Avatar
                    src={avatarPreview}
                    name={user.displayName ?? user.username}
                    size={96}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-gold text-brand-purple flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Photo de profil</h3>
                  <p className="text-sm text-slate-400">JPG, PNG ou WEBP. Max 5 Mo.</p>
                </div>
              </div>

              {/* SECTION: INFORMATIONS DE BASE */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold font-display block mb-6 text-brand-gold">
                  Informations de base
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">
                      Prénom
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      defaultValue={user.firstName ?? ""}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">
                      Nom
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      defaultValue={user.lastName ?? ""}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">
                      {user?.role === "SELLER" ? "Pseudo / Nom d'artiste" : "Pseudo"}
                    </label>
                    <input
                      name="displayName"
                      type="text"
                      defaultValue={user.displayName ?? user.username}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={user.email ?? ""}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: BOUTIQUE & LIENS */}
              <div className="glass rounded-2xl p-6 mb-8 border border-brand-gold/10">
                <h3 className="text-lg font-bold font-display block mb-6 text-brand-gold">
                  {user?.role === "SELLER" ? "Boutique & Liens" : "Liens Web"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Site web personnel
                    </label>
                    <input
                      name="website"
                      type="url"
                      defaultValue={user.website ?? ""}
                      placeholder="https://votre-site.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>

                  {user?.role === "SELLER" && (
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-400" /> Email PayPal (Paiements)
                      </label>
                      <input
                        name="paypalEmail"
                        type="email"
                        defaultValue={(user.sellerProfile as any)?.paypalEmail ?? ""}
                        placeholder="paypal@votre-email.com"
                        className="w-full px-4 py-3 bg-green-500/5 border border-green-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-400/50"
                      />
                    </div>
                  )}

                  {user?.role === "SELLER" && (
                    <div className="md:col-span-2 mt-2">
                      <label className="text-sm font-semibold text-slate-300 mb-3 block">
                        Genres musicaux principaux
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {GENRES.map((genre) => (
                          <label key={genre} className="cursor-pointer">
                            <input
                              name="genres"
                              type="checkbox"
                              value={genre}
                              defaultChecked={user.sellerProfile?.genres?.includes(genre)}
                              className="peer sr-only"
                            />
                            <span className="inline-block px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-slate-300 peer-checked:bg-brand-gold peer-checked:text-brand-purple peer-checked:border-brand-gold peer-checked:font-semibold hover:bg-white/10 transition-all">
                              {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: BIO / DESCRIPTION */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold font-display block mb-6 text-brand-gold">
                  {user?.role === "SELLER" ? "Bio / Description de la boutique" : "Bio"}
                </h3>
                <textarea
                  name="bio"
                  rows={5}
                  defaultValue={user.bio ?? ""}
                  placeholder={user?.role === "SELLER" ? "Présentez-vous et décrivez votre univers musical à vos clients..." : "Un petit mot sur vous..."}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 resize-y"
                />
              </div>

              {/* SECTION: CONTACT & ADRESSE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* ADRESSE ENTIÈRE */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-bold font-display block mb-6 text-brand-gold">
                    Coordonnées
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Téléphone
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        defaultValue={user.phone ?? ""}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                        <Home className="w-4 h-4" /> Adresse
                      </label>
                      <input
                        name="address"
                        type="text"
                        defaultValue={user.address ?? ""}
                        placeholder="12 rue Exemple"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Ville
                        </label>
                        <input
                          name="city"
                          type="text"
                          defaultValue={user.city ?? ""}
                          placeholder="Paris"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Code Postal
                        </label>
                        <input
                          name="postalCode"
                          type="text"
                          defaultValue={user.postalCode ?? ""}
                          placeholder="75000"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Pays
                      </label>
                      <select
                        name="country"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                        defaultValue={(user as any).country ?? "FR"}
                      >
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="CH">Suisse</option>
                        <option value="CA">Canada</option>
                        <option value="SN">Sénégal</option>
                        <option value="CI">Côte d&apos;Ivoire</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* RÉSEAUX SOCIAUX */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-bold font-display block mb-6 text-brand-gold">
                    Réseaux Sociaux
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Instagram className="w-5 h-5 text-pink-500" />
                      </div>
                      <input
                        name="instagram"
                        type="text"
                        defaultValue={user.instagram ?? ""}
                        placeholder="Pseudo Instagram"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Twitter className="w-5 h-5 text-blue-400" />
                      </div>
                      <input
                        name="twitter"
                        type="text"
                        defaultValue={user.twitter ?? ""}
                        placeholder="Pseudo Twitter / X"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Youtube className="w-5 h-5 text-red-500" />
                      </div>
                      <input
                        name="youtube"
                        type="url"
                        defaultValue={user.youtube ?? ""}
                        placeholder="Lien chaîne YouTube"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-10 pt-8 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group px-10 py-3 rounded-full font-bold text-brand-purple overflow-hidden flex items-center gap-3 disabled:opacity-50 transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 bg-brand-gold group-hover:bg-amber-400 transition-colors"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white/50 to-transparent blur-md transition-opacity"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </span>
                </button>
              </div>
            </form>
          )}



          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <form
                onSubmit={handlePasswordSave}
                className="glass rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">
                      Sécurité du compte
                    </h2>
                    <p className="text-sm text-slate-400">
                      Gérez votre mot de passe pour protéger l'accès à votre compte.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          name="currentPassword"
                          required
                          type={showPassword ? "text" : "password"}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 pr-12 transition-colors"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block">
                        Nouveau mot de passe
                      </label>
                      <input
                        name="newPassword"
                        required
                        type="password"
                        minLength={8}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span> Minimum 8 caractères, majuscules, chiffres et symboles.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-300 mb-2 block">
                        Confirmer le mot de passe
                      </label>
                      <input
                        name="confirmPassword"
                        required
                        type="password"
                        minLength={8}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-10 pt-8 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative group px-10 py-3 rounded-full font-bold text-brand-purple overflow-hidden flex items-center gap-3 disabled:opacity-50 transition-all hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-brand-gold group-hover:bg-amber-400 transition-colors"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white/50 to-transparent blur-md transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </span>
                  </button>
                </div>
              </form>

              <div className="glass rounded-3xl p-8 border border-red-500/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-500/80"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                  <div>
                    <h2 className="text-2xl font-bold font-display mb-2 flex items-center gap-3 text-red-400">
                      <Trash2 className="w-6 h-6" /> Zone de danger
                    </h2>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                      La suppression de votre compte est une action <strong className="text-white">irréversible</strong>. Toutes vos données, y compris vos achats, vos beats postés et votre historique seront définitivement perdus.
                    </p>
                  </div>
                  <button
                    onClick={handleAccountDeletion}
                    type="button"
                    className="shrink-0 px-8 py-4 rounded-full font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-105"
                  >
                    Supprimer le compte
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && user && (
            <form
              onSubmit={handleNotificationsSave}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-brand-gold" /> Préférences de
                notification
              </h2>
              <div className="space-y-4">
                {[
                  {
                    name: "newMessages",
                    label: "Nouveaux messages",
                    desc: "Recevoir une notification pour chaque nouveau message",
                    default: user.notificationPrefs?.newMessages ?? true,
                  },
                  {
                    name: "newBeats",
                    label: "Nouveaux beats",
                    desc: "Être notifié des nouvelles publications de vos producteurs favoris",
                    default: user.notificationPrefs?.newBeats ?? true,
                  },
                  {
                    name: "promotions",
                    label: "Promotions",
                    desc: "Recevoir les offres spéciales et codes promo",
                    default: user.notificationPrefs?.promotions ?? false,
                  },
                  {
                    name: "newsletter",
                    label: "Newsletter",
                    desc: "Newsletter hebdomadaire avec les tendances et nouveautés",
                    default: user.notificationPrefs?.newsletter ?? true,
                  },
                  {
                    name: "forumReplies",
                    label: "Réponses forum",
                    desc: "Notifications des réponses à vos discussions",
                    default: user.notificationPrefs?.forumReplies ?? true,
                  },
                  {
                    name: "updates",
                    label: "Mises à jour",
                    desc: "Informations sur les nouvelles fonctionnalités de SUMVIBES",
                    default: user.notificationPrefs?.updates ?? false,
                  },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between glass rounded-xl p-4"
                  >
                    <div>
                      <div className="font-semibold text-sm">{notif.label}</div>
                      <div className="text-xs text-slate-400">{notif.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        name={notif.name}
                        type="checkbox"
                        defaultChecked={notif.default}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-10 pt-8 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group px-10 py-3 rounded-full font-bold text-brand-purple overflow-hidden flex items-center gap-3 disabled:opacity-50 transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 bg-brand-gold bg-opacity-100 group-hover:bg-amber-400 transition-colors"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white/50 to-transparent blur-md transition-opacity"></div>

                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "Enregistrement..." : "Enregistrer les préférences"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && user && (
            <form
              onSubmit={handlePreferencesSave}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
                <Music className="w-6 h-6 text-brand-gold" /> Préférences
                musicales
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-3 block">
                    Genres préférés
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {GENRES.map((genre) => (
                      <label key={genre} className="cursor-pointer">
                        <input
                          name="preferredGenres"
                          type="checkbox"
                          value={genre}
                          defaultChecked={user.musicPrefs?.preferredGenres?.includes(
                            genre,
                          )}
                          className="peer sr-only"
                        />
                        <span className="inline-block px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-slate-300 peer-checked:bg-brand-gold peer-checked:text-brand-purple peer-checked:border-brand-gold peer-checked:font-semibold hover:bg-white/10 transition-all">
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-3 block">
                    Moods préférés
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Dark",
                      "Chill",
                      "Uplifting",
                      "Energetic",
                      "Romantic",
                      "Aggressive",
                      "Melancholic",
                    ].map((mood) => (
                      <label key={mood} className="cursor-pointer">
                        <input
                          name="preferredMoods"
                          type="checkbox"
                          value={mood}
                          defaultChecked={user.musicPrefs?.preferredMoods?.includes(
                            mood,
                          )}
                          className="peer sr-only"
                        />
                        <span className="inline-block px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-slate-300 peer-checked:bg-brand-gold peer-checked:text-brand-purple peer-checked:border-brand-gold peer-checked:font-semibold hover:bg-white/10 transition-all">
                          {mood}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
              <div className="flex justify-end mt-10 pt-8 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group px-10 py-3 rounded-full font-bold text-brand-purple overflow-hidden flex items-center gap-3 disabled:opacity-50 transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 bg-brand-gold bg-opacity-100 group-hover:bg-amber-400 transition-colors"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white/50 to-transparent blur-md transition-opacity"></div>

                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "Enregistrement..." : "Enregistrer les préférences"}
                  </span>
                </button>
              </div>
            </form>
          )}
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
