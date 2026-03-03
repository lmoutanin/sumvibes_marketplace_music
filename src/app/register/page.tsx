"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Music,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    artistName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BUYER" as "BUYER" | "SELLER",
    gdprConsent: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!formData.gdprConsent) {
      setError("Vous devez accepter les conditions générales.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          artistName: formData.artistName,
          username: formData.username,
          role: formData.role,
          gdprConsent: formData.gdprConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        return;
      }
      router.push("/login?registered=true");
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient mb-4">
              Créer un compte
            </h1>
            <p className="text-slate-300">Rejoignez la communauté SUMVIBES</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "BUYER" }))
              }
              className={`glass rounded-2xl p-6 text-center transition-all hover:scale-[1.02] ${
                formData.role === "BUYER"
                  ? "ring-2 ring-brand-gold bg-brand-gold/5"
                  : ""
              }`}
            >
              <ShoppingBag
                className={`w-10 h-10 mx-auto mb-3 ${formData.role === "BUYER" ? "text-brand-gold" : "text-slate-400"}`}
              />
              <h3 className="font-bold text-lg mb-1">Acheteur</h3>
              <p className="text-xs text-slate-400">
                Achetez des beats pour vos projets musicaux
              </p>
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "SELLER" }))
              }
              className={`glass rounded-2xl p-6 text-center transition-all hover:scale-[1.02] ${
                formData.role === "SELLER"
                  ? "ring-2 ring-brand-gold bg-brand-gold/5"
                  : ""
              }`}
            >
              <Music
                className={`w-10 h-10 mx-auto mb-3 ${formData.role === "SELLER" ? "text-brand-gold" : "text-slate-400"}`}
              />
              <h3 className="font-bold text-lg mb-1">Vendeur</h3>
              <p className="text-xs text-slate-400">
                Vendez vos productions musicales
              </p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-3xl p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Votre prénom"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                />
              </div>
            </div>

            {/* Si l'utilisateur choisit "SELLER", afficher le champ "Nom d'artiste" */}
            {formData.role === "SELLER" && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  Nom d&apos;artiste
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  required={formData.role === "SELLER"}
                  placeholder="Votre nom d'artiste / pseudo"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                />
              </div>
            )}

            {/* Si l'utilisateur choisit "BUYER", afficher le champ "Username" */}
            {formData.role === "BUYER" && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required={formData.role === "BUYER"}
                  placeholder="Votre nom d'utilisateur / pseudo"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
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
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 8 caractères
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  Confirmer
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
              </div>
            </div>

            {/* GDPR */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="gdprConsent"
                  checked={formData.gdprConsent}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-gold focus:ring-brand-gold/50"
                />
                <span className="text-sm text-slate-400">
                  J&apos;accepte les{" "}
                  <Link href="/cgv" className="text-brand-gold hover:underline">
                    Conditions Générales de Vente
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/privacy"
                    className="text-brand-gold hover:underline"
                  >
                    Politique de Confidentialité
                  </Link>
                  . Conformément au RGPD, vos données sont traitées de manière
                  sécurisée.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Inscription en cours..."
              ) : (
                <>
                  Créer mon compte <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-400 mt-6">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="text-brand-gold hover:underline font-semibold"
              >
                Se connecter
              </Link>
            </p>
          </form>

          {/* Benefits */}
          <div className="glass rounded-2xl p-6 mt-8">
            <h3 className="font-bold font-display mb-4">
              Pourquoi rejoindre SUMVIBES ?
            </h3>
            <div className="space-y-3">
              {[
                "Accès à des milliers de beats de qualité professionnelle",
                "Communauté active de producteurs et artistes",
                "Paiements sécurisés et licences claires",
                "Support réactif et accompagnement personnalisé",
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
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
