// src/store/cartStore.ts
import { ICartItem, ICartStore } from '@/interface/cart'
import { create } from 'zustand'
import { persist } from 'zustand/middleware' // ← add this


export const useCartStore = create<ICartStore>()(
  persist( // ← wrap with persist
    (set) => ({
      isOpen: false,
      items: [],

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item: ICartItem) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id)
        return {
          isOpen: true,
          items: existing
            ? state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...state.items, { ...item, quantity: 1 }],
        }
      }),

      removeItem: (id: string) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      decreaseItem: (id: string) => set((state) => ({
        items: state.items
          .map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
          .filter((i) => i.quantity > 0),
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',     
      partialize: (state) => ({ items: state.items }), 
    }
  )
)