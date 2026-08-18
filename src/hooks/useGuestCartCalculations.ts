import { useMemo } from "react";
import { useGuestDiscount } from "./useGuestDiscount";
import { useActiveOffers } from "./useActiveOffers";
import { bestBogoOutcome, type BogoLine, type BogoOutcome } from "@/lib/bogo";

interface CartItem {
  price: number;
  quantity: number;
  /** Identifies the row for per-line bogo allocations. */
  key?: string;
  productId?: number;
  categoryIds?: number[];
}

export const useGuestCartCalculations = (items: CartItem[]) => {
  const { getGuestDiscount } = useGuestDiscount();
  const { offers } = useActiveOffers();

  const calculations = useMemo(() => {
    const discount = getGuestDiscount();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let couponDiscount = 0;
    if (discount) {
      if (discount.discountType === "percent") {
        couponDiscount = subtotal * (discount.discountAmount / 100);
      } else {
        couponDiscount = Math.min(discount.discountAmount, subtotal);
      }
    }

    // Recomputed from the current cart on every change, so a quantity edit can
    // never leave a stale free item behind.
    const lines: BogoLine[] = items.map((item, index) => ({
      key: item.key ?? `line:${index}`,
      unitPrice: item.price,
      quantity: item.quantity,
      productId: item.productId,
      categoryIds: item.categoryIds,
    }));

    const bogo: BogoOutcome | null = offers.length
      ? bestBogoOutcome(lines, offers, subtotal)
      : null;
    const bogoDiscount = bogo?.discountAmount ?? 0;

    // Mirrors the server: a guest coupon and an offer do not stack, the shopper
    // gets whichever is worth more.
    const combined = couponDiscount && bogoDiscount
      ? Math.max(couponDiscount, bogoDiscount)
      : couponDiscount + bogoDiscount;

    const discountAmount = Math.min(combined, subtotal);
    const appliedBogo = bogoDiscount >= couponDiscount ? bogo : null;

    return {
      subtotal,
      discountAmount,
      total: subtotal - discountAmount,
      appliedDiscount: discount,
      appliedOffer: appliedBogo,
    };
  }, [items, getGuestDiscount, offers]);

  return calculations;
};
