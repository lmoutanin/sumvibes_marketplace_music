"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function ContactSellerButton({ sellerId }: { sellerId: string }) {
    const { user } = useAuth();

    if (user?.id === sellerId) return null;

    return (
        <Link href={`/community/messages?new=${sellerId}`} className="w-full bg-white/10 hover:bg-white/15 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-white/10 text-white group">
            <MessageSquare className="w-5 h-5 group-hover:text-brand-gold transition-colors" /> Contacter le prestataire
        </Link>
    );
}
