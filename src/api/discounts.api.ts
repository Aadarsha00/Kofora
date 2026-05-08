/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import {
  ValidateCouponRequest,
  ValidateCouponResponse,
  ValidateCouponApiResponse,
} from "@/interface/discounts";

export const validateCoupon = async (
  code: string,
  subtotal: number
): Promise<ValidateCouponResponse> => {
  try {
    const payload: ValidateCouponRequest = { code, subtotal };
    const response = await api.post<ValidateCouponApiResponse>(
      "/discounts/coupons/validate/",
      payload
    );
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const listActiveCoupons = async (): Promise<any[]> => {
  try {
    const response = await api.get<any>("/discounts/coupons/?is_active=true");
    return response.data.data.results || [];
  } catch (error: any) {
    throw error?.response?.data;
  }
};
