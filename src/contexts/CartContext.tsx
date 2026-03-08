"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CartItem {
  licenseType: string | null;
  id: string;
  beat?: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    basicPrice: number;
    seller: {
      sellerProfile: { artistName: string } | null;
    };
  };
  service?: {
    id: string;
    title: string;
    category: string;
    price: number;
    seller: {
      sellerProfile: { artistName: string } | null;
    };
  };
  license?: {
    id: string;
    name: string;
    price: number;
  };
  price: number;
}

interface CartData {
  items: CartItem[];
  total: number;
  count: number;
}

interface CartContextType {
  cart: CartData;
  loading: boolean;
  addToCart: (beatId: string, license: string) => Promise<boolean>;
  addServiceToCart: (serviceId: string) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData>({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCart({ items: [], total: 0, count: 0 });
        setLoading(false);
        return;
      }
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        const items = data.cartItems || [];
        let total = data.total || 0;
        setCart({ items, total, count: items.length });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (beatId: string, license: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ beatId, licenseType: license })
      });

      if (res.ok) {
        await fetchCart();
        return true;
      }

      // Récupère et relance l'erreur API pour que la modal puisse l'afficher
      const data = await res.json().catch(() => ({}));
      const errorMessage = data.error || `Erreur ${res.status}`;

      // Ne pas logger en rouge si c'est une erreur 400 ou 404 (ex: déjà dans le panier, beat non disponible)
      // Car ces erreurs sont gérées et affichées via la modal.
      if (res.status !== 400 && res.status !== 404) {
        console.error('Error adding to cart:', errorMessage);
      }

      throw new Error(errorMessage);
    } catch (error) {
      throw error; // on relance pour que la modal puisse afficher le message
    }
  };

  const addServiceToCart = async (serviceId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceId })
      });

      if (res.ok) {
        await fetchCart();
        return true;
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Erreur lors de l'ajout au panier");
    } catch (error) {
      console.error('Error adding service to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      // Mise à jour optimiste : on retire l'item immédiatement sans attendre l'API
      setCart(prev => {
        const items = prev.items.filter(i => i.id !== cartItemId);
        const total = items.reduce((sum, item) => sum + Number(item.price), 0);
        return { items, total, count: items.length };
      });

      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        return true;
      } else {
        // Si l'API échoue, on recharge le vrai état
        await fetchCart();
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      await fetchCart();
      return false;
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      for (const item of cart.items) {
        await fetch(`/api/cart?id=${item.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      setCart({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, addServiceToCart, removeFromCart, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}