"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export function AddToCartButton({ serviceId, sellerId }: { serviceId: string; sellerId: string }) {
    const { user } = useAuth();
    const { addServiceToCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState("");

    // Le vendeur ne peut pas acheter son propre service
    if (user?.id === sellerId) return null;

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await addServiceToCart(serviceId);
            setAdded(true);
            setTimeout(() => setAdded(false), 4000);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'ajout au panier");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleAddToCart}
                disabled={loading || added}
                className={`w-full btn-primary px-6 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-black mb-1 text-lg flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed ${added ? "bg-green-400" : ""}`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : added ? (
                    <><Check className="w-5 h-5" /> Ajouté au panier !</>
                ) : (
                    <><ShoppingCart className="w-5 h-5" /> Commander</>
                )}
            </button>
            {added && (
                <button
                    onClick={() => router.push("/cart")}
                    className="w-full text-sm text-brand-gold underline hover:no-underline text-center"
                >
                    Voir mon panier →
                </button>
            )}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
    );
}
