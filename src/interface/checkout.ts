import { ApiEnvelope } from "@/interface/cart";

export interface Address {
  id: number;
  user: number;
  full_name: string;
  phone: string;
  company: string;
  country: string;
  state_province: string;
  city: string;
  postal_code: string;
  address_line_1: string;
  address_line_2: string;
  address_type: "home" | "work" | "other";
  is_default_shipping: boolean;
  is_default_billing: boolean;
  is_active: boolean;
}

export type AddressInput = Omit<Address, "id" | "user">;

export interface ShippingMethod {
  id: number;
  zone: number;
  name: string;
  code: string;
  base_rate: string;
  free_shipping_threshold: string | null;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  product_name: string;
  variant_sku: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  line_total: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  currency: string;
  subtotal: string;
  discount_amount: string;
  shipping_amount: string;
  tax_amount: string;
  grand_total: string;
  payment_status: string;
  fulfillment_status: string;
  customer_notes: string;
  staff_notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export type PaymentProvider = "stripe" | "paypal";

export interface OrderStatusHistory {
  id: number;
  from_status: string;
  to_status: string;
  note: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: number;
  order: number;
  provider: PaymentProvider;
  provider_payment_id: string;
  provider_reference_id: string;
  checkout_url: string;
  amount: string;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  idempotency_key: string;
  failure_reason: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type AddressListResponse = ApiEnvelope<PaginatedResponse<Address>>;
export type AddressResponse = ApiEnvelope<Address>;
export type ShippingMethodListResponse = ApiEnvelope<PaginatedResponse<ShippingMethod>>;
export type OrderResponse = ApiEnvelope<Order>;
export type OrderListResponse = ApiEnvelope<Order[]>;
export type PaymentTransactionResponse = ApiEnvelope<PaymentTransaction>;
