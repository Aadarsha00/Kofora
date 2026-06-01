import api from "@/axios/api.axios";
import {
  AdminCoupon,
  AdminCouponInput,
  AdminCouponListResponse,
  AdminCouponResponse,
  AdminDiscount,
  AdminDiscountInput,
  AdminDiscountListParams,
  AdminDiscountListResponse,
  AdminDiscountResponse,
} from "@/interface/admin";
import { PaginatedResponse } from "@/interface/checkout";

// ─── Discounts ────────────────────────────────────────────────
export const getAdminDiscounts = async (
  params: AdminDiscountListParams = {}
): Promise<PaginatedResponse<AdminDiscount>> => {
  const response = await api.get<AdminDiscountListResponse>("/discounts/", { params });
  return response.data.data;
};

export const getAdminDiscount = async (id: number): Promise<AdminDiscount> => {
  const response = await api.get<AdminDiscountResponse>(`/discounts/${id}/`);
  return response.data.data;
};

export const createAdminDiscount = async (payload: AdminDiscountInput): Promise<AdminDiscount> => {
  const response = await api.post<AdminDiscountResponse>("/discounts/", payload);
  return response.data.data;
};

export const updateAdminDiscount = async (
  id: number,
  payload: Partial<AdminDiscountInput>
): Promise<AdminDiscount> => {
  const response = await api.patch<AdminDiscountResponse>(`/discounts/${id}/`, payload);
  return response.data.data;
};

export const deleteAdminDiscount = async (id: number): Promise<void> => {
  await api.delete(`/discounts/${id}/`);
};

// ─── Coupon codes ─────────────────────────────────────────────
export const getDiscountCoupons = async (discountId: number): Promise<AdminCoupon[]> => {
  const response = await api.get<AdminCouponListResponse>("/discounts/coupons/", {
    params: { discount: discountId, page_size: 100 },
  });
  return response.data.data.results ?? [];
};

export const createCoupon = async (payload: AdminCouponInput): Promise<AdminCoupon> => {
  const response = await api.post<AdminCouponResponse>("/discounts/coupons/", payload);
  return response.data.data;
};

export const updateCoupon = async (
  id: number,
  payload: Partial<AdminCouponInput>
): Promise<AdminCoupon> => {
  const response = await api.patch<AdminCouponResponse>(`/discounts/coupons/${id}/`, payload);
  return response.data.data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await api.delete(`/discounts/coupons/${id}/`);
};
