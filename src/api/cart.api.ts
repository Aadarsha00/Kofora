/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import {
  Cart,
  CartApiResponse,
  UpdateCartItemRequest,
  SetShippingMethodRequest,
  SetAddressRequest,
} from "@/interface/cart";

export const getCart = async (): Promise<Cart> => {
  const response = await api.get<CartApiResponse>("/cart/me/");
  return response.data.data;
};

export const addItemToCart = async (
  variantId: number,
  quantity: number = 1
): Promise<Cart> => {
  try {
    const payload = {
      variantId,   // ✅ camelCase — matches what backend expects
      quantity,
    };
    const response = await api.post<CartApiResponse>("/cart/items/", payload);
    return response.data.data;
  } catch (error: any) {
    console.error("[addItemToCart] Full error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to add item to cart";
    throw new Error(message);
  }
};

export const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<Cart> => {
  try {
    const payload: UpdateCartItemRequest = { quantity };
    const response = await api.patch<CartApiResponse>(
      `/cart/items/${itemId}/`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const removeCartItem = async (itemId: number): Promise<Cart> => {
  try {
    const response = await api.delete<CartApiResponse>(`/cart/items/${itemId}/`);
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const clearCart = async (): Promise<Cart> => {
  try {
    const response = await api.post<CartApiResponse>("/cart/clear/");
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const applyCoupon = async (couponCode: string): Promise<Cart> => {
  try {
    const payload = { code: couponCode };
    const response = await api.post<CartApiResponse>("/cart/apply-coupon/", payload);
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const removeCoupon = async (): Promise<Cart> => {
  try {
    console.log("[removeCoupon] Calling remove coupon endpoint");
    const response = await api.post<CartApiResponse>("/cart/remove-coupon/");
    console.log("[removeCoupon] Response:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("[removeCoupon] Error response:", error?.response?.data);
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to remove coupon";
    throw new Error(errorMessage);
  }
};

export const setShippingMethod = async (shippingMethodId: number): Promise<Cart> => {
  try {
    const payload: SetShippingMethodRequest = { shipping_method_id: shippingMethodId };
    const response = await api.post<CartApiResponse>("/cart/shipping-method/", payload);
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const mergeGuestCart = async (guestItems: any[]): Promise<Cart> => {
  try {
    console.log("[mergeGuestCart] Raw guest items:", guestItems);
    
    // Transform guest items to include only variantId and quantity
    const transformedItems = guestItems
      .filter((item) => item.variantId) // Filter out items without variantId
      .map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity || 1,
      }));

    console.log("[mergeGuestCart] Transformed items:", transformedItems);
    
    const payload = { guestItems: transformedItems };
    console.log("[mergeGuestCart] Sending payload:", payload);
    
    const response = await api.post<CartApiResponse>("/cart/merge-guest/", payload);
    console.log("[mergeGuestCart] Response:", response.data);
    
    return response.data.data;
  } catch (error: any) {
    console.error("[mergeGuestCart] Error:", error);
    throw error?.response?.data;
  }
};

export const setShippingAddress = async (addressId: number): Promise<Cart> => {
  try {
    const payload: SetAddressRequest = { address_id: addressId };
    const response = await api.post<CartApiResponse>("/cart/shipping-address/", payload);
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const setBillingAddress = async (addressId: number): Promise<Cart> => {
  try {
    const payload: SetAddressRequest = { address_id: addressId };
    const response = await api.post<CartApiResponse>("/cart/billing-address/", payload);
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
