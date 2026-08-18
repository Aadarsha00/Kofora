import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminDiscount,
  createCoupon,
  createDiscountRule,
  deleteAdminDiscount,
  deleteCoupon,
  deleteDiscountRule,
  getAdminDiscount,
  getAdminDiscounts,
  getDiscountCoupons,
  getDiscountRules,
  updateAdminDiscount,
  updateCoupon,
} from "@/api/adminDiscounts.api";
import {
  AdminCouponInput,
  AdminDiscountInput,
  AdminDiscountListParams,
  AdminDiscountRuleInput,
} from "@/interface/admin";

export const useAdminDiscounts = (params: AdminDiscountListParams) =>
  useQuery({
    queryKey: ["admin-discounts", params],
    queryFn: () => getAdminDiscounts(params),
    placeholderData: keepPreviousData,
  });

export const useAdminDiscount = (id: number | undefined) =>
  useQuery({
    queryKey: ["admin-discount", id],
    queryFn: () => getAdminDiscount(id as number),
    enabled: Boolean(id),
  });

export const useCreateAdminDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDiscountInput) => createAdminDiscount(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-discounts"] }),
  });
};

export const useUpdateAdminDiscount = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AdminDiscountInput>) => updateAdminDiscount(id, payload),
    onSuccess: (discount) => {
      queryClient.setQueryData(["admin-discount", id], discount);
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
    },
  });
};

export const useDeleteAdminDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminDiscount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-discounts"] }),
  });
};

// ─── Coupons (scoped to a discount) ───────────────────────────
export const useDiscountCoupons = (discountId: number | undefined) =>
  useQuery({
    queryKey: ["discount-coupons", discountId],
    queryFn: () => getDiscountCoupons(discountId as number),
    enabled: Boolean(discountId),
  });

export const useSaveCoupon = (discountId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: AdminCouponInput }) =>
      id ? updateCoupon(id, payload) : createCoupon(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discount-coupons", discountId] }),
  });
};

export const useDeleteCoupon = (discountId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discount-coupons", discountId] }),
  });
};

// ─── Scope rules (scoped to a discount) ───────────────────────
export const useDiscountRules = (discountId: number | undefined) =>
  useQuery({
    queryKey: ["discount-rules", discountId],
    queryFn: () => getDiscountRules(discountId as number),
    enabled: Boolean(discountId),
  });

export const useCreateDiscountRule = (discountId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDiscountRuleInput) => createDiscountRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount-rules", discountId] });
      // The discount detail embeds its rules, so it goes stale too.
      queryClient.invalidateQueries({ queryKey: ["admin-discount", discountId] });
    },
  });
};

export const useDeleteDiscountRule = (discountId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDiscountRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount-rules", discountId] });
      queryClient.invalidateQueries({ queryKey: ["admin-discount", discountId] });
    },
  });
};
