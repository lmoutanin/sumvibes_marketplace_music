"use client";

import Link from "next/link";
import { Star, MapPin, Clock, MessageSquare, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const SERVICE_CATEGORIES = [
  { id: "all",      label: "Tous" },
  { id: "mixage",   label: "Mixage & Mastering" },
  { id: "ecriture", label: "Écriture / Toplining" },
  { id: "design",   label: "Design & Artwork" },
  { id: "video",    label: "Vidéo & Clips" },
  { id: "coaching", label: "Coaching" },
  { id: "promo",    label: "Promotion" },
];

export interface ServiceData {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  price: number | string;
  deliveryTime?: string | null;
  location?: string | null;
  rating?: number | string | null;
  reviewsCount?: number;
  featured?: boolean;
  sellerId: string;
  seller: {
    id?: string;
    displayName?: string | null;
    username: string;
    sellerProfile?: { artistName?: string | null } | null;
  };
}

export function ServiceCard({ service, featured }: { service: ServiceData; featured?: boolean }) {
  const { user } = useAuth();
  const authorName = service.seller?.sellerProfile?.artistName || service.seller?.displayName || service.seller?.username || "Unknown";
  const catParam = SERVICE_CATEGORIES.find((c) => c.id === service.category);
  const sellerId = service.sellerId || service.seller?.id;

  return (
    <div
      className={`glass rounded-3xl p-6 lg:p-8 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full ${
        featured
          ? "border border-brand-gold/30 shadow-[0_10px_40px_rgba(254,215,102,0.08)] bg-gradient-to-br from-white/[0.07] to-white/[0.02]"
          : "border border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black/20"
      }`}
    >
      {featured && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 blur-[50px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl glass bg-black/40 flex items-center justify-center shadow-inner border border-white/10 group-hover:scale-110 transition-transform">
            <Briefcase className="w-7 h-7 text-brand-gold/60" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-brand-gold uppercase mb-1 bg-brand-gold/10 inline-block px-2 py-0.5 rounded-md border border-brand-gold/20">
              {catParam?.label || service.category}
            </div>
            <p className="text-sm font-medium text-slate-300">
              Par{" "}
              <Link
                href={`/producers/${service.seller?.id || sellerId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-white hover:text-brand-gold transition-colors font-semibold"
              >
                {authorName}
              </Link>
            </p>
          </div>
        </div>

        {featured && (
          <div className="bg-brand-gold text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(254,215,102,0.4)] flex items-center gap-1">
            <Star className="w-3 h-3 fill-black" /> PRO
          </div>
        )}
      </div>

      <Link href={`/community/services/${service.id}`}>
        <h3 className="font-bold text-xl mb-3 text-white leading-snug relative z-10 group-hover:text-brand-gold transition-colors line-clamp-2">
          {service.title}
        </h3>
      </Link>

      {service.description && (
        <p className="text-sm text-slate-400 mb-6 font-light line-clamp-3 relative z-10 flex-grow">
          {service.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-300 mb-6 relative z-10">
        <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
          <span className="text-white">{service.rating?.toString() || "0"}</span>
          ({service.reviewsCount ?? 0})
        </span>
        <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <MapPin className="w-3.5 h-3.5 text-brand-purple-light" />
          {service.location || "En ligne"}
        </span>
        <span className="flex items-center gap-1.5 glass bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <Clock className="w-3.5 h-3.5 text-green-400" />
          {service.deliveryTime || "À définir"}
        </span>
      </div>

      <div className="pt-5 border-t border-white/10 flex items-center justify-between relative z-10 mt-auto">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Tarif de base</span>
          <div className="text-brand-gold font-bold text-xl drop-shadow-md">
            €{Number(service.price).toFixed(2)}
          </div>
        </div>
        <div className="flex gap-2">
          {user?.id !== sellerId && (
            <Link
              href={`/community/messages?new=${sellerId}`}
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-xl glass bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white hover:text-brand-gold border border-white/10 hover:border-brand-gold/30"
              title="Contacter le prestataire"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
