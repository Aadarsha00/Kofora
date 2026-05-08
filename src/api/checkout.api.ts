import api from "@/axios/api.axios";
import {
  Address,
  AddressInput,
  AddressListResponse,
  AddressResponse,
  Order,
  OrderListResponse,
  OrderResponse,
  PaymentTransaction,
  PaymentTransactionResponse,
  ShippingMethod,
  ShippingMethodListResponse,
} from "@/interface/checkout";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get<AddressListResponse>("/addresses/");
  return response.data.data.results ?? [];
};

export const createAddress = async (payload: AddressInput): Promise<Address> => {
  const response = await api.post<AddressResponse>("/addresses/", payload);
  return response.data.data;
};

export const getShippingMethods = async (): Promise<ShippingMethod[]> => {
  const response = await api.get<ShippingMethodListResponse>("/shipping/methods/?is_active=true&page_size=100");
  return response.data.data.results ?? [];
};

export const createOrderFromCart = async (customerNotes: string): Promise<Order> => {
  const response = await api.post<OrderResponse>("/orders/create-from-cart/", {
    customer_notes: customerNotes,
  });
  return response.data.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<OrderListResponse>("/orders/me/");
  return response.data.data;
};

export const createStripeCheckoutSession = async (payload: {
  order_id: number;
  idempotency_key: string;
  success_url: string;
  cancel_url: string;
}): Promise<PaymentTransaction> => {
  const response = await api.post<PaymentTransactionResponse>("/payments/stripe/checkout-sessions/", payload);
  return response.data.data;
};

export const createPayPalOrder = async (payload: {
  order_id: number;
  idempotency_key: string;
  return_url: string;
  cancel_url: string;
}): Promise<PaymentTransaction> => {
  const response = await api.post<PaymentTransactionResponse>("/payments/paypal/orders/", payload);
  return response.data.data;
};

export const capturePayPalOrder = async (payload: {
  order_id: number;
  provider_payment_id: string;
  payer_id: string;
}): Promise<PaymentTransaction> => {
  const response = await api.post<PaymentTransactionResponse>("/payments/paypal/capture/", payload);
  return response.data.data;
};

export const confirmStripeCheckoutSession = async (payload: {
  order_id: number;
  provider_payment_id: string;
}): Promise<PaymentTransaction> => {
  const response = await api.post<PaymentTransactionResponse>("/payments/stripe/checkout-sessions/confirm/", payload);
  return response.data.data;
};
