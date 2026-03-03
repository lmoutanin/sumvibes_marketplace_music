"use client";

import { useState } from "react";
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
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

// (Dynamic tabs will be created inside the component based on user role)
const baseTabs = [
  { id: "profile", label: "Profil Client", icon: User },
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

  const tabs =
    user?.role === "SELLER"
      ? [
          { id: "profile", label: "Profil Client", icon: User },
          { id: "seller", label: "Profil Vendeur", icon: Music },
          ...baseTabs.slice(1),
        ]
      : baseTabs;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
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
    };

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

  const handleSellerSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      artistName: formData.get("artistName") as string,
      description: formData.get("description") as string,
      genres: formData.getAll("genres") as string[],
      paypalEmail: formData.get("paypalEmail") as string,
    };

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
                className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeTab === tab.id
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
              <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-brand-gold" /> Informations
                personnelles (Client)
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-brand-gold to-yellow-500 flex items-center justify-center text-4xl font-bold text-brand-purple">
                    {(user.displayName ?? user.username ?? "").slice(0, 2)}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-gold text-brand-purple flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold">Photo de profil</h3>
                  <p className="text-sm text-slate-400">
                    JPG, PNG ou GIF. Max 2 Mo.
                  </p>
                </div>
              </div>

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
                    Pseudo (Display Name)
                  </label>
                  <input
                    name="displayName"
                    type="text"
                    defaultValue={user.displayName ?? user.username ?? ""}
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
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue={user.bio ?? ""}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 resize-none"
                  />
                </div>
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
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold font-display mb-4 mt-4 border-b border-white/10 pb-2">
                    Réseaux Sociaux & Contact
                  </h3>
                </div>
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
                    <Instagram className="w-4 h-4" /> Instagram (Nom
                    d&apos;utilisateur)
                  </label>
                  <input
                    name="instagram"
                    type="text"
                    defaultValue={user.instagram ?? ""}
                    placeholder="@votre_pseudo"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                    <Twitter className="w-4 h-4" /> Twitter / X
                  </label>
                  <input
                    name="twitter"
                    type="text"
                    defaultValue={user.twitter ?? ""}
                    placeholder="@votre_pseudo"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2">
                    <Youtube className="w-4 h-4" /> YouTube
                  </label>
                  <input
                    name="youtube"
                    type="url"
                    defaultValue={user.youtube ?? ""}
                    placeholder="Lien vers la chaîne"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
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
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 rounded-full font-semibold mt-8 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          )}

          {/* Seller Tab */}
          {activeTab === "seller" && user?.role === "SELLER" && (
            <form onSubmit={handleSellerSave} className="glass rounded-3xl p-8">
              <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
                <Music className="w-6 h-6 text-brand-gold" /> Informations
                Vendeur
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Nom d&apos;artiste / Beatmaker
                  </label>
                  <input
                    name="artistName"
                    type="text"
                    defaultValue={user.sellerProfile?.artistName ?? ""}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Email PayPal pour les paiements
                  </label>
                  <input
                    name="paypalEmail"
                    type="email"
                    defaultValue={
                      (user.sellerProfile as any)?.paypalEmail ?? ""
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Description de la boutique
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={user.sellerProfile?.description ?? ""}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Genres musicaux principaux
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {GENRES.map((genre) => (
                      <label key={genre} className="cursor-pointer">
                        <input
                          name="genres"
                          type="checkbox"
                          value={genre}
                          defaultChecked={user.sellerProfile?.genres?.includes(
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
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 rounded-full font-semibold mt-8 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <form
                onSubmit={handlePasswordSave}
                className="glass rounded-3xl p-8"
              >
                <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-brand-gold" /> Changer le mot de
                  passe
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        name="currentPassword"
                        required
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">
                      Nouveau mot de passe
                    </label>
                    <input
                      name="newPassword"
                      required
                      type="password"
                      minLength={8}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Minimum 8 caractères avec majuscules, chiffres et
                      caractères spéciaux
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-3 rounded-full font-semibold flex items-center gap-2 disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? "Modification..." : "Modifier le mot de passe"}
                  </button>
                </div>
              </form>

              <div className="glass rounded-3xl p-8">
                <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-brand-gold" />{" "}
                  Authentification à deux facteurs
                </h2>
                <p className="text-slate-400 mb-4">
                  Ajoutez une couche de sécurité supplémentaire à votre compte.
                </p>
                <button className="glass px-6 py-3 rounded-full font-semibold hover:bg-white/10">
                  Activer la 2FA
                </button>
              </div>

              <div className="glass rounded-3xl p-8 border border-red-500/20">
                <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2 text-red-400">
                  <Trash2 className="w-6 h-6" /> Zone dangereuse
                </h2>
                <p className="text-slate-400 mb-4">
                  La suppression de votre compte est irréversible. Toutes vos
                  données seront perdues.
                </p>
                <button
                  onClick={handleAccountDeletion}
                  type="button"
                  className="glass px-6 py-3 rounded-full font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                >
                  Supprimer mon compte
                </button>
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
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 rounded-full font-semibold mt-6 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
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
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Langue de l&apos;interface
                  </label>
                  <select
                    name="language"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-gold/50"
                    defaultValue={user.musicPrefs?.language ?? "fr"}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 rounded-full font-semibold mt-8 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
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
