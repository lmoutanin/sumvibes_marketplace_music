"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Plus, Loader2, ArrowRight, Star, MapPin, Clock, Edit2, Pencil, X, Save, AlertCircle, Check } from "lucide-react";

// --- Types & Modal Component ---

type Service = any;

function SLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            {children}
        </p>
    );
}

function SInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-slate-600
        focus:outline-none focus:border-brand-gold/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-brand-gold/20 transition-all ${className}`}
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

function EditServiceModal({
    service,
    token,
    onClose,
    onSaved,
}: {
    service: Service;
    token: string;
    onClose: () => void;
    onSaved: (s: Service) => void;
}) {
    const [edit, setEdit] = useState({
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price?.toString() || "",
        deliveryTime: service.deliveryTime || "",
        location: service.location || ""
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const set = (key: string, val: string) => setEdit(p => ({ ...p, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await fetch(`/api/services/${service.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: edit.title,
                    description: edit.description,
                    category: edit.category,
                    price: parseFloat(edit.price) || 0,
                    deliveryTime: edit.deliveryTime,
                    location: edit.location
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Erreur ${res.status}`);
            }
            const data = await res.json();
            onSaved(data.service);
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1000);
        } catch (e: any) {
            setError(e.message || "Erreur inconnue");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-xl h-full bg-[#0a0a0f] border-l border-white/10 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]">
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.07] shrink-0">
                    <div className="relative w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center bg-brand-gold/10 overflow-hidden">
                        <Briefcase className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-base truncate">
                            Modifier le service
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    <div>
                        <SLabel>Titre *</SLabel>
                        <SInput value={edit.title} onChange={e => set("title", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <SLabel>Prix de base (€) *</SLabel>
                            <SInput type="number" step="0.01" value={edit.price} onChange={e => set("price", e.target.value)} />
                        </div>
                        <div>
                            <SLabel>Catégorie</SLabel>
                            <select
                                value={edit.category}
                                onChange={e => set("category", e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-gold/50 appearance-none"
                            >
                                <option value="mixage">Mixage & Mastering</option>
                                <option value="ecriture">Écriture / Toplining</option>
                                <option value="design">Design & Artwork</option>
                                <option value="video">Vidéo & Clips</option>
                                <option value="coaching">Coaching</option>
                                <option value="promo">Promotion</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <SLabel>Description détaillée *</SLabel>
                        <STextarea rows={6} value={edit.description} onChange={e => set("description", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <SLabel>Délai de livraison (ex: 3-5 jours)</SLabel>
                            <SInput value={edit.deliveryTime} onChange={e => set("deliveryTime", e.target.value)} />
                        </div>
                        <div>
                            <SLabel>Localisation (ex: En ligne, Paris)</SLabel>
                            <SInput value={edit.location} onChange={e => set("location", e.target.value)} />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-white/12 text-slate-400 text-sm font-semibold hover:border-white/25 hover:text-white transition-all">
                        Annuler
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50 ${saved ? "bg-emerald-500 text-white" : "bg-brand-gold text-slate-900 hover:brightness-110 shadow-[0_4px_20px_rgba(212,175,55,0.3)]"}`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Sauvegardé</> : <><Save className="w-4 h-4" /> Enregistrer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// -------------------------------

export default function SellerServicesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

    const tokenLocal = typeof window !== 'undefined' ? localStorage.getItem("token") || "" : "";

    useEffect(() => {
        if (user && user.role !== "SELLER" && user.role !== "ADMIN") {
            router.push("/account");
            return;
        }

        async function fetchMyServices() {
            setLoading(true);
            try {
                if (!user) return;
                const currentUserId = user.id;

                const queryParams = new URLSearchParams();
                queryParams.append("limit", "100"); // fetch all for the dashboard
                queryParams.append("sellerId", currentUserId);

                const res = await fetch(`/api/services?${queryParams.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setServices(data.services);
                }
            } catch (error) {
                console.error("Error fetching my services:", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchMyServices();
        }
    }, [user, router]);

    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
        return (
            <div className="min-h-screen bg-gradient-premium flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-premium">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-2">
                                <span className="text-gradient drop-shadow-lg">Mes Services</span>
                            </h1>
                            <p className="text-slate-300 font-light max-w-xl">
                                Gérez vos propositions de services ou ajoutez-en de nouvelles.
                            </p>
                        </div>
                        <Link href="/seller/services/create" className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-[length:200%_auto] hover:bg-[position:right_center] rounded-full font-extrabold text-black overflow-hidden shadow-[0_4px_20px_rgba(254,204,51,0.4)] hover:shadow-[0_8px_30px_rgba(254,204,51,0.6)] hover:-translate-y-1 transition-all duration-500 z-10">
                            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-full" />
                            <Plus className="w-5 h-5 relative z-10 drop-shadow-sm" />
                            <span className="relative z-10 drop-shadow-sm">Nouveau Service</span>
                        </Link>
                    </div>

                    <div className="glass rounded-3xl p-6 lg:p-8 mb-16 border border-white/10 shadow-2xl">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                            </div>
                        ) : services.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => (
                                    <div key={service.id} className="glass rounded-3xl p-6 hover:-translate-y-1 transition-all group border border-white/10 hover:border-brand-gold/30 bg-black/20 flex flex-col h-full">

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-[11px] font-bold tracking-widest text-brand-gold uppercase bg-brand-gold/10 inline-block px-2 py-0.5 rounded-md border border-brand-gold/20">
                                                {service.category}
                                            </div>
                                            {service.featured && (
                                                <div className="bg-brand-gold text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(254,204,51,0.4)] flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-black" /> PRO
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-xl mb-3 text-white leading-snug line-clamp-2">
                                            {service.title}
                                        </h3>

                                        <p className="text-sm text-slate-400 mb-6 font-light line-clamp-3 flex-grow">
                                            {service.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-300 mb-6">
                                            <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" /> <span className="text-white">{service.rating?.toString() || "0"}</span> ({service.reviewsCount})</span>
                                            <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-3.5 h-3.5 text-brand-purple-light" /> {service.location || "En ligne"}</span>
                                            <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><Clock className="w-3.5 h-3.5 text-green-400" /> {service.deliveryTime || "À définir"}</span>
                                        </div>

                                        <div className="pt-5 border-t border-white/10 flex items-center justify-between mt-auto">
                                            <div>
                                                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Tarif de base</span>
                                                <div className="text-brand-gold font-bold text-xl drop-shadow-md">€{service.price?.toString()}</div>
                                            </div>
                                            <button
                                                onClick={() => setEditingServiceId(service.id)}
                                                className="w-10 h-10 rounded-xl glass bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] text-white hover:text-brand-gold border border-white/10 hover:border-brand-gold/30 hover:scale-105"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 px-4">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    <Briefcase className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold font-display mb-3">Aucun service</h3>
                                <p className="text-slate-400 max-w-sm mx-auto mb-8 font-light">
                                    Vous n'avez pas encore proposé de service sur la marketplace.
                                </p>
                                <Link
                                    href="/seller/services/create"
                                    className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-[length:200%_auto] hover:bg-[position:right_center] rounded-full font-extrabold text-black overflow-hidden shadow-[0_4px_20px_rgba(254,204,51,0.3)] hover:shadow-[0_8px_30px_rgba(254,204,51,0.5)] hover:-translate-y-1 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-full" />
                                    <span className="relative z-10 drop-shadow-sm">Créer votre premier service</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modale d'édition intégrée */}
            {editingServiceId && (
                <EditServiceModal
                    service={services.find(s => s.id === editingServiceId)}
                    token={tokenLocal}
                    onClose={() => setEditingServiceId(null)}
                    onSaved={(updated) => {
                        setServices(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
                    }}
                />
            )}
        </div>
    );
}

// Icon we need that isn't imported
function Eye(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
