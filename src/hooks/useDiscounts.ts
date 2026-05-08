import { useQuery, useMutation } from "@tanstack/react-query";
import { validateCoupon, listActiveCoupons } from "@/api/discounts.api";

const COUPON_QUERY_KEY = ["coupons"];

// ─── VALIDATE COUPON ────────────────────────────────────────────
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      validateCoupon(code, subtotal),
    onError: (error) => {
      console.error("[Discounts] Error validating coupon:", error);
    },
  });
};

// ─── LIST ACTIVE COUPONS ────────────────────────────────────────
export const useActiveCoupons = () => {
  return useQuery({
    queryKey: COUPON_QUERY_KEY,
    queryFn: listActiveCoupons,
  });
};
