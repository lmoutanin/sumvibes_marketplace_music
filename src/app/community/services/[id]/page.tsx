import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, Star, MapPin, Clock, MessageSquare, Briefcase, Calendar } from "lucide-react";
import { ContactSellerButton } from "./ContactSellerButton";

async function getService(id: string) {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/services/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        return null;
    }

    return res.json();
}

export default async function ServiceDetailsPage({ params }: { params: { id: string } }) {
    const service = await getService(params.id);

    if (!service) {
        notFound();
    }

    const authorName = service.seller?.sellerProfile?.artistName || service.seller?.username || "Unknown";

    return (
        <div className="relative min-h-screen bg-black text-slate-200">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-6">
                <div className="mx-auto max-w-5xl">
                    <Link href="/community/services" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8 transition-colors text-sm font-medium">
                        <ChevronLeft className="w-5 h-5" /> Retour aux services
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="glass p-8 rounded-3xl border border-white/10 bg-black/40">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="text-xs font-bold tracking-widest text-brand-gold uppercase bg-brand-gold/10 inline-block px-3 py-1 rounded-md border border-brand-gold/20">
                                        {service.category}
                                    </div>
                                    {service.featured && (
                                        <div className="bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-black" /> Premium
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight mb-4">
                                    {service.title}
                                </h1>

                                <p className="text-slate-300 font-light text-lg whitespace-pre-wrap">
                                    {service.description}
                                </p>
                            </div>

                            {/* Reviews Section Placeholder */}
                            <div className="glass p-8 rounded-3xl border border-white/10 bg-black/40">
                                <h3 className="text-2xl font-bold font-display mb-6">Avis Clients</h3>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="text-5xl font-bold text-brand-gold">{service.rating?.toString() || "0"}</div>
                                    <div className="flex flex-col">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-5 h-5 ${s <= (service.rating || 0) ? 'text-brand-gold fill-brand-gold' : 'text-slate-600'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-400">Sur la base de {service.reviewsCount} avis</span>
                                    </div>
                                </div>

                                {service.reviewsCount === 0 ? (
                                    <p className="text-slate-500 italic">Aucun avis pour le moment.</p>
                                ) : (
                                    <p className="text-slate-500 italic">Les avis seront affichés ici...</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Checkout / Contact Card */}
                            <div className="glass p-6 rounded-3xl border border-white/10 bg-black/40 text-center sticky top-24">
                                <div className="mb-6">
                                    <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold block mb-2">Tarif de base</span>
                                    <div className="text-3xl font-bold text-brand-gold drop-shadow-md">€{service.price?.toString()}</div>
                                </div>

                                <div className="space-y-3 mb-8 text-sm text-slate-300">
                                    <div className="flex flex-col gap-2">
                                        <span className="flex justify-between items-center glass bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-400" /> Livraison</span>
                                            <span className="font-semibold text-white">{service.deliveryTime || "À convenir"}</span>
                                        </span>
                                        <span className="flex justify-between items-center glass bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-purple-light" /> Localisation</span>
                                            <span className="font-semibold text-white">{service.location || "En ligne"}</span>
                                        </span>
                                    </div>
                                </div>

                                <button className="w-full btn-primary px-6 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-black mb-3 text-lg">
                                    Commander
                                </button>
                                <ContactSellerButton sellerId={service.sellerId} />
                            </div>

                            {/* Author Card */}
                            <div className="glass p-6 rounded-3xl border border-white/10 bg-black/40">
                                <span className="text-sm text-slate-400 font-semibold block mb-4 uppercase tracking-widest">À propos du prestataire</span>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-premium flex items-center justify-center text-xl font-bold text-black border-2 border-brand-gold shadow-lg">
                                        {authorName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white hover:text-brand-gold transition-colors cursor-pointer">{authorName}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" /> {service.rating?.toString() || "0"}
                                        </div>
                                    </div>
                                </div>
                                {service.seller?.sellerProfile?.description && (
                                    <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                                        {service.seller.sellerProfile.description}
                                    </p>
                                )}
                                <Link href={`/user/${service.seller?.username || 'profile'}`} className="text-sm text-brand-gold font-semibold hover:underline flex items-center gap-1">
                                    Voir le profil complet
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
