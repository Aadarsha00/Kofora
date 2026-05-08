import { create } from "zustand";

interface ProductModalStore {
  productId: number | null;
  gender: string | null;
  slug: string | null;
  open: (id: number, gender: string, slug: string) => void;
  close: () => void;
}

export const useProductModal = create<ProductModalStore>()((set) => ({
  productId: null,
  gender: null,
  slug: null,
  open: (id, gender, slug) => set({ productId: id, gender, slug }),
  close: () => set({ productId: null, gender: null, slug: null }),
}));