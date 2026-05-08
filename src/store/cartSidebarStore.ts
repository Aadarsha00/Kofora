import { create } from "zustand";

interface CartSidebarStore {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartSidebarStore = create<CartSidebarStore>((set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
