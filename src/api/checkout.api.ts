import api from "@/axios/api.axios";
import {
  Address,
  AddressInput,
  AddressListResponse,
  AddressResponse,
  AddressValidationResponse,
  AddressValidationResult,
  Order,
  OrderListResponse,
  OrderResponse,
  PaymentTransaction,
  PaymentTransactionResponse,
  ShippingMethod,
  ShippingMethodListResponse,
  ShippingRateQuote,
  ShippingRatesResponse,
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

// Live UPS price for every shipping method against a specific address, in one
// call - lets checkout show every option's real price up front instead of
// only whichever one happens to already be synced onto the cart.
export const getShippingRates = async (addressId: number): Promise<ShippingRateQuote[]> => {
  const response = await api.get<ShippingRatesResponse>("/cart/shipping-rates/", {
    params: { address_id: addressId },
  });
  return response.data.data.rates ?? [];
};

// UPS's own address validation (non-billable, same as rating) - catches
// addresses UPS considers ambiguous or undeliverable before checkout ever
// tries to rate or ship them, and offers the real correction UPS suggests.
export const validateShippingAddress = async (address: AddressInput): Promise<AddressValidationResult> => {
  const response = await api.post<AddressValidationResponse>("/shipping/ups/validate-address/", {
    full_name: address.full_name,
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2,
    city: address.city,
    state_province: address.state_province,
    postal_code: address.postal_code,
    country: address.country,
  });
  return response.data.data;
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
