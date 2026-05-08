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
      console.log("[GuestCart] useEffect - Loading from localStorage:", { stored, hasKey: !!stored });
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log("[GuestCart] useEffect - Parsed items:", parsed);
          setItems(parsed);
        } catch (error) {
          console.error("[GuestCart] Failed to parse stored cart:", error);
        }
      }
      setIsLoading(false);
      console.log("[GuestCart] useEffect - isLoading set to false");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    console.log("[GuestCart] Saving to localStorage:", { items, itemCount: items.length });
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((variantId: number, productName: string, quantity: number) => {
    console.log("[GuestCart] addItem called:", { variantId, productName, quantity });
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.variantId === variantId);
      if (existing) {
        const updated = prevItems.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log("[GuestCart] Updated item, new items:", updated);
        return updated;
      }
      const newItems = [...prevItems, { variantId, productName, quantity }];
      console.log("[GuestCart] Added new item, new items:", newItems);
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
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const stored = localStorage.getItem(GUEST_CART_KEY);
    console.log("[GuestCart] getItemCount:", { count, itemsInState: items.length, itemsInStorage: stored ? JSON.parse(stored).length : 0 });
    return count;
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
