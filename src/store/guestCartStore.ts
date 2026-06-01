import { create } from "zustand";

export interface GuestCartItem {
  variantId: number;
  productName: string;
  quantity: number;
  price: string;
  maxAvailable?: number;
}

const GUEST_CART_KEY = "guest-cart-items";

interface GuestCartStore {
  items: GuestCartItem[];
  isLoading: boolean;
  
  // Actions
  addItem: (variantId: number, productName: string, quantity: number, price?: string, maxAvailable?: number) => void;
  updateItem: (variantId: number, quantity: number, maxAvailable?: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  loadFromStorage: () => void;
  getItemCount: () => number;
}

export const useGuestCartStore = create<GuestCartStore>((set, get) => {
  // Load from localStorage on creation (safely check for client-side)
  const stored = typeof window !== "undefined" ? localStorage.getItem(GUEST_CART_KEY) : null;
  const initialItems = stored ? JSON.parse(stored) : [];

  return {
    items: initialItems,
    isLoading: false,

    addItem: (variantId, productName, quantity, price = "0", maxAvailable) => {
      set((state) => {
        const existing = state.items.find((item) => item.variantId === variantId);
        const stockLimit = maxAvailable ?? existing?.maxAvailable;
        let newItems: GuestCartItem[];

        if (existing) {
          newItems = state.items.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, stockLimit ?? item.quantity + quantity),
                  maxAvailable: stockLimit,
                }
              : item
          );
        } else {
          newItems = [
            ...state.items,
            {
              variantId,
              productName,
              quantity: Math.min(quantity, stockLimit ?? quantity),
              price,
              maxAvailable: stockLimit,
            },
          ];
        }

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));

        return { items: newItems };
      });
    },

    updateItem: (variantId, quantity, maxAvailable) => {
      set((state) => {
        const newItems = state.items
          .map((item) => {
            if (item.variantId !== variantId) return item;
            const stockLimit = maxAvailable ?? item.maxAvailable;
            return {
              ...item,
              quantity: Math.min(quantity, stockLimit ?? quantity),
              maxAvailable: stockLimit,
            };
          })
          .filter((item) => item.quantity > 0);

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));

        return { items: newItems };
      });
    },

    removeItem: (variantId) => {
      set((state) => {
        const newItems = state.items.filter((item) => item.variantId !== variantId);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));

        return { items: newItems };
      });
    },

    clearCart: () => {
      localStorage.removeItem(GUEST_CART_KEY);
      set({ items: [] });
    },

    loadFromStorage: () => {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      const items = stored ? JSON.parse(stored) : [];
      set({ items });
    },

    getItemCount: () => {
      const state = get();
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
  };
});
