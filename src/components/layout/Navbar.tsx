"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ShoppingCart, User, LogOut, Settings, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, loading, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    return (
        <nav className="fixed top-0 z-50 w-full glass border-b border-white/5">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-brand-gold/30 group-hover:border-brand-gold/60 transition-all">
                        <Image
                            src="/logo.jpg"
                            alt="SUMVIBES Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-2xl font-bold tracking-tighter text-gradient font-display">
                        SUMVIBES
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-10 md:flex">
                    <Link href="/catalogue" className="text-sm font-medium hover:text-brand-gold transition-colors relative group">
                        Catalogue
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-gold to-brand-purple group-hover:w-full transition-all"></span>
                    </Link>
                    <Link href="/producers" className="text-sm font-medium hover:text-brand-gold transition-colors relative group">
                        Producteurs
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-gold to-brand-purple group-hover:w-full transition-all"></span>
                    </Link>
                    <Link href="/community" className="text-sm font-medium hover:text-brand-gold transition-colors relative group">
                        Communauté
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-gold to-brand-purple group-hover:w-full transition-all"></span>
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-4 md:flex">
                    {!loading && (
                        <>
                            <Link href="/cart" className="glass p-2 rounded-xl hover:bg-white/10 transition-all relative">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink rounded-full text-xs flex items-center justify-center font-bold">0</span>
                            </Link>

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 glass px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        {user.avatar ? (
                                            <Image src={user.avatar} alt={user.displayName || user.username} width={32} height={32} className="rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink flex items-center justify-center font-bold">
                                                {(user.displayName || user.username || "?")[0].toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium">{user.displayName || user.username}</span>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 glass rounded-xl border border-white/10 overflow-hidden animate-fade-in">
                                            <div className="p-4 border-b border-white/10">
                                                <p className="font-semibold text-sm">{user.displayName || user.username}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                                <span className="inline-block mt-2 px-2 py-1 bg-brand-gold/10 text-brand-gold text-xs rounded-full">
                                                    {user.role === "SELLER" ? "Vendeur" : user.role === "ADMIN" ? "Admin" : "Acheteur"}
                                                </span>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/account" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-sm">Mon compte</span>
                                                </Link>
                                                <Link href="/account/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                    <span className="text-sm">Paramètres</span>
                                                </Link>
                                                {user.role === "SELLER" && (
                                                    <>
                                                        <Link href="/seller/dashboard" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
                                                            <ShoppingCart className="w-4 h-4" />
                                                            <span className="text-sm">Dashboard vendeur</span>
                                                        </Link>
                                                    </>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="text-sm">Déconnexion</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-medium hover:text-brand-gold transition-colors flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Connexion
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-full bg-gradient-to-r from-brand-purple to-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-purple/30"
                                    >
                                        Rejoindre
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden glass p-2 rounded-xl hover:bg-white/10 transition-all"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass border-t border-white/10 animate-fade-in">
                    <div className="px-6 py-6 space-y-4">
                        <Link href="/catalogue" className="block text-lg font-medium hover:text-brand-gold transition-colors">
                            Catalogue
                        </Link>
                        <Link href="/producers" className="block text-lg font-medium hover:text-brand-gold transition-colors">
                            Producteurs
                        </Link>
                        <Link href="/community" className="block text-lg font-medium hover:text-brand-gold transition-colors">
                            Communauté
                        </Link>
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <Link href="/login" className="block w-full text-left font-medium hover:text-brand-gold transition-colors">
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="block text-center rounded-full bg-gradient-to-r from-brand-purple to-brand-pink px-6 py-3 font-bold text-white"
                            >
                                Rejoindre
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
