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
  console.log("[GuestCart] Initial load from localStorage, key:", GUEST_CART_KEY, "value:", stored);
  
  const initialItems = stored ? JSON.parse(stored) : [];
  console.log("[GuestCart] Initial items parsed:", initialItems);
  console.log("[GuestCart] Initial items count:", initialItems.length);


  return {
    items: initialItems,
    isLoading: false,

    addItem: (variantId, productName, quantity, price = "0", maxAvailable) => {
      set((state) => {
        console.log(`[GuestCart] Adding item - variantId: ${variantId}, productName: ${productName}, quantity: ${quantity}, price: ${price}`);
        
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

        // Save to localStorage
        console.log("[GuestCart] Saving to localStorage:", newItems);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));

        return { items: newItems };
      });
    },

    updateItem: (variantId, quantity, maxAvailable) => {
      set((state) => {
        console.log(`[GuestCart] Updating item - variantId: ${variantId}, new quantity: ${quantity}`);
        
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

        console.log("[GuestCart] Items after update:", newItems);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));

        return { items: newItems };
      });
    },

    removeItem: (variantId) => {
      set((state) => {
        console.log(`[GuestCart] Removing item - variantId: ${variantId}`);
        
        const newItems = state.items.filter((item) => item.variantId !== variantId);
        console.log("[GuestCart] Items after removal:", newItems);
        
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));

        return { items: newItems };
      });
    },

    clearCart: () => {
      console.log("[GuestCart] Clearing guest cart from localStorage");
      localStorage.removeItem(GUEST_CART_KEY);
      set({ items: [] });
    },

    loadFromStorage: () => {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      console.log("[GuestCart] Loading from storage, raw value:", stored);
      
      const items = stored ? JSON.parse(stored) : [];
      console.log("[GuestCart] Parsed items:", items);
      
      set({ items });
    },

    getItemCount: () => {
      const state = get();
      const count = state.items.reduce((total, item) => total + item.quantity, 0);
      console.log("[GuestCart] Getting item count:", count);
      return count;
    },
  };
});
