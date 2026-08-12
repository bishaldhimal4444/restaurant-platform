'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const CART_STORAGE_KEY = 'guest_cart';

export function useCart() {
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCart(parsed);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const calculateTotal = useCallback((items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existingIndex = prev.items.findIndex((i) => i.id === item.id);
      
      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = prev.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...prev.items, { ...item, quantity: 1 }];
      }
      
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  }, [calculateTotal]);

  const removeItem = useCallback((itemId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId);
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  }, [calculateTotal]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart((prev) => {
      const newItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  }, [calculateTotal, removeItem]);

  const clearCart = useCallback(() => {
    setCart({ items: [], total: 0 });
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cart.items,
    total: cart.total,
    itemCount,
    isHydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
