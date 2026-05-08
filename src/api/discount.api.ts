/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";

export interface FirstOrderDiscountResponse {
  success: boolean;
  data: {
    claim_token: string;
    discount_id: number;
    discount_type: "flat" | "percent";
    discount_amount: number;
    expires_at: string;
    message: string;
  };
  message: string;
}

export const applyFirstOrderDiscount = async (email: string): Promise<FirstOrderDiscountResponse> => {
  try {
    const response = await api.post<FirstOrderDiscountResponse>("/discounts/first-order/", {
      email,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || new Error(error?.message || "Failed to apply discount");
  }
};

export const applyFirstOrderClaim = async (claimToken: string) => {
  try {
    const response = await api.post("/discounts/first-order/apply/", {
      claim_token: claimToken,
    });
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data || new Error(error?.message || "Failed to apply discount");
  }
};
