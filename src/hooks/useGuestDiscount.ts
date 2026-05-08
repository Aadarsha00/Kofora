import { useCallback } from "react";

const GUEST_DISCOUNT_KEY = "kofora_guest_discount";

export interface GuestDiscount {
  claimToken: string;
  email: string; // Email that claimed this discount
  discountId: number;
  discountType: "flat" | "percent";
  discountAmount: number;
  expiresAt: string;
  appliedAt: string;
}

export const useGuestDiscount = () => {
  const getGuestDiscount = useCallback((): GuestDiscount | null => {
    if (typeof window === "undefined") return null;
    
    const stored = localStorage.getItem(GUEST_DISCOUNT_KEY);
    if (!stored) return null;
    
    try {
      const discount = JSON.parse(stored) as Partial<GuestDiscount>;
      if (!discount.claimToken || !discount.email) {
        localStorage.removeItem(GUEST_DISCOUNT_KEY);
        return null;
      }
      return discount as GuestDiscount;
    } catch {
      localStorage.removeItem(GUEST_DISCOUNT_KEY);
      return null;
    }
  }, []);

  const setGuestDiscount = useCallback((discount: GuestDiscount | null) => {
    if (typeof window === "undefined") return;
    
    if (discount) {
      localStorage.setItem(GUEST_DISCOUNT_KEY, JSON.stringify(discount));
    } else {
      localStorage.removeItem(GUEST_DISCOUNT_KEY);
    }
  }, []);

  const clearGuestDiscount = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GUEST_DISCOUNT_KEY);
  }, []);

  return {
    getGuestDiscount,
    setGuestDiscount,
    clearGuestDiscount,
  };
};
