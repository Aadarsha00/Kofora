export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  code: string;
  discount_amount: number;
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: null | unknown;
}

export type ValidateCouponApiResponse = ApiEnvelope<ValidateCouponResponse>;

export interface Coupon {
  id: number;
  code: string;
  discount: {
    id: number;
    name: string;
    discount_type: "flat" | "percent";
    flat_amount?: number;
    percentage?: number;
    is_active: boolean;
  };
  is_active: boolean;
}
