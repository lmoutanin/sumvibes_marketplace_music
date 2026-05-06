import Link from "next/link";
import { Music, Instagram, Twitter, Youtube, Mail, MapPin, Check } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative pt-24 pb-12 overflow-hidden border-t border-white/[0.06]">
            {/* Background Accents — alignés avec bg-gradient-premium du catalogue */}
            <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-brand-gold/5 blur-[140px] rounded-none pointer-events-none" />
            <div className="absolute top-10 right-1/3 w-80 h-80 bg-brand-purple/8 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-64 bg-brand-pink/6 blur-[120px] rounded-full pointer-events-none" />

            {/* Ligne décorative dorée en haut */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    {/* ── Branding ── */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold to-amber-600 flex items-center justify-center shadow-lg shadow-brand-gold/20">
                                <Music className="w-6 h-6 text-slate-950" />
                            </div>
                            <span className="text-2xl font-bold font-display tracking-tight text-white italic">
                                SUMVIBES
                            </span>
                        </div>
                        <p className="text-slate-500 leading-relaxed max-w-sm text-sm">
                            La marketplace premium pour les compositeurs visionnaires et les artistes en quête d&apos;excellence. Élevez votre son, dominez l&apos;industrie.
                        </p>

                        {/* Réseaux sociaux */}
                        <div className="flex gap-3">
                            {[
                                { icon: Instagram, href: "https://instagram.com", label: "Instagram", hover: "hover:border-pink-500/50 hover:text-pink-400 hover:shadow-pink-500/10" },
                                { icon: Twitter, href: "https://twitter.com", label: "Twitter", hover: "hover:border-blue-400/50 hover:text-blue-400 hover:shadow-blue-400/10" },
                                { icon: Youtube, href: "https://youtube.com", label: "YouTube", hover: "hover:border-red-500/50 hover:text-red-400 hover:shadow-red-500/10" },
                            ].map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    aria-label={social.label}
                                    className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg ${social.hover}`}
                                >
                                    <social.icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ── Plateforme ── */}
                    <div>
                        <h3 className="text-white/90 font-bold text-sm uppercase tracking-widest mb-8 font-display flex items-center gap-2">
                            <span className="w-4 h-px bg-brand-gold/60" />
                            Plateforme
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Catalogue", href: "/catalogue", tag: null },
                                { name: "Producteurs", href: "/producers", tag: null },
                                { name: "Communauté", href: "/community", tag: null }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="group flex items-center gap-2 text-slate-500 hover:text-brand-gold transition-colors duration-200 text-sm">
                                        <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-brand-gold transition-colors" />
                                        {item.name}
                                        {item.tag && (
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-brand-gold/15 text-brand-gold border border-brand-gold/25">
                                                {item.tag}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Support & Légal ── */}
                    <div>
                        <h3 className="text-white/90 font-bold text-sm uppercase tracking-widest mb-8 font-display flex items-center gap-2">
                            <span className="w-4 h-px bg-brand-gold/60" />
                            Support & Légal
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Aide & FAQ", href: "/help" },
                                { name: "Conditions de Vente", href: "/cgv" },
                                { name: "Confidentialité", href: "/privacy" },
                                { name: "Contact", href: "/contact" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="group flex items-center gap-2 text-slate-500 hover:text-brand-gold transition-colors duration-200 text-sm">
                                        <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-brand-gold transition-colors" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Contact ── */}
                    <div>
                        <h3 className="text-white/90 font-bold text-sm uppercase tracking-widest mb-8 font-display flex items-center gap-2">
                            <span className="w-4 h-px bg-brand-gold/60" />
                            Contact
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                                </div>
                                <span className="text-slate-500 text-sm leading-relaxed">
                                    Guadeloupe, France
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-3.5 h-3.5 text-brand-gold" />
                                </div>
                                <a
                                    href="mailto:contact@sumvibes.fr"
                                    className="text-slate-500 hover:text-brand-gold transition-colors text-sm"
                                >
                                    contact@sumvibes.fr
                                </a>
                            </div>
                        </div>

                        {/* Badge confiance */}
                        <div className="mt-8 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs font-semibold">Paiement sécurisé</p>
                                <p className="text-slate-600 text-[11px]">SSL · Stripe certified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bas de page ── */}
                <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-slate-600 text-xs">
                        © {new Date().getFullYear()}{" "}
                        <span className="text-slate-400 font-bold">SUMVIBES</span>. Tous droits réservés.
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <span>Fait pour les artistes</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}