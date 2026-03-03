import { useState, useEffect, useCallback } from 'react';

interface CartItem {
  id: string;
  beat: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    basicPrice: number;
    seller: {
      sellerProfile: { artistName: string } | null;
    };
  };
  license: {
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

export function useCart() {
  const [cart, setCart] = useState<CartData>({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        const items = data.cartItems || [];
        const total = items.reduce((sum: number, item: CartItem) => sum + Number(item.price), 0);
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

  const addToCart = async (beatId: string, license: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ beatId, license })
      });

      if (res.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Clear all items one by one
      for (const item of cart.items) {
        await removeFromCart(item.id);
      }
      
      setCart({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };
}
