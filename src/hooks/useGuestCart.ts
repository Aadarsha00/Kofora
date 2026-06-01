"use client";

import { useState, useEffect, useCallback } from "react";

export interface GuestCartItem {
  variantId: number;
  productName: string;
  quantity: number;
}

const GUEST_CART_KEY = "guest-cart-items";

export const useGuestCart = () => {
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setItems(parsed);
        } catch (error) {
          console.error("[GuestCart] Failed to parse stored cart:", error);
        }
      }
      setIsLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((variantId: number, productName: string, quantity: number) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.variantId === variantId);
      if (existing) {
        const updated = prevItems.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return updated;
      }
      const newItems = [...prevItems, { variantId, productName, quantity }];
      return newItems;
    });
  }, []);

  const updateItem = useCallback((variantId: number, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
    isLoading,
  };
};
