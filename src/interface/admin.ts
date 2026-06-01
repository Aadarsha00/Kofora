import { ApiEnvelope } from "@/interface/cart";
import { OrderItem, OrderStatusHistory, PaginatedResponse } from "@/interface/checkout";
import { Product, ProductVariant } from "@/interface/Product";

export const FULFILLMENT_STATUSES = [
  "pending",
  "awaiting_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "partially_refunded",
  "refunded",
  "returned",
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  returned: "Returned",
};

export interface AdminOrderCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AdminOrderAddressSnapshot {
  id: number;
  address_type: "billing" | "shipping";
  full_name: string;
  phone: string;
  company: string;
  country: string;
  state_province: string;
  city: string;
  postal_code: string;
  address_line_1: string;
  address_line_2: string;
}

export interface AdminOrderListItem {
  id: number;
  order_number: string;
  customer: AdminOrderCustomer;
  currency: string;
  grand_total: string;
  payment_status: string;
  fulfillment_status: string;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderDetail {
  id: number;
  order_number: string;
  customer: AdminOrderCustomer;
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
  status_history: OrderStatusHistory[];
  address_snapshots: AdminOrderAddressSnapshot[];
}

export interface AdminOrderStatusUpdate {
  fulfillment_status: FulfillmentStatus;
  note?: string;
  staff_notes?: string;
}

export interface AdminOrderListParams {
  page?: number;
  page_size?: number;
  search?: string;
  fulfillment_status?: string;
  ordering?: string;
}

export type AdminOrderListResponse = ApiEnvelope<PaginatedResponse<AdminOrderListItem>>;
export type AdminOrderResponse = ApiEnvelope<AdminOrderDetail>;

// ─── Products ─────────────────────────────────────────────────
export const CURRENCY_OPTIONS = ["USD", "CAD"] as const;

export interface AdminProductInput {
  name: string;
  slug: string;
  brand: string;
  short_description: string;
  full_description: string;
  is_active: boolean;
  is_featured: boolean;
  is_published: boolean;
  base_currency: string;
  seo_title: string;
  seo_description: string;
  categories: number[];
}

export interface AdminVariantInput {
  product: number;
  sku: string;
  barcode?: string;
  title?: string;
  size: string;
  color: string;
  price: string;
  compare_at_price?: string | null;
  cost_price?: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  weight_grams?: number | null;
}

export type StagedVariantInput = Omit<AdminVariantInput, "product">;

export interface StagedImage {
  id: string;
  file?: File;
  image_url?: string;
  alt_text: string;
  previewUrl: string;
  color?: string;
}

export interface AdminUploadedImage {
  id: number;
  product: number;
  image: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  variant_id: number | null;
}

export interface AdminImageUploadInput {
  product: number;
  image?: File;
  image_url?: string;
  alt_text?: string;
  sort_order?: number;
  is_active?: boolean;
  variant_id?: number | null;
}

export interface AdminProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: string;
  is_published?: string;
  is_featured?: string;
  ordering?: string;
}

export type AdminProductListResponse = ApiEnvelope<PaginatedResponse<Product>>;
export type AdminProductResponse = ApiEnvelope<Product>;
export type AdminVariantResponse = ApiEnvelope<ProductVariant>;
export type AdminUploadedImageResponse = ApiEnvelope<AdminUploadedImage>;

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardRecentOrder {
  id: number;
  order_number: string;
  customer_email: string;
  grand_total: number | string;
  currency: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
}

export interface DashboardLowStock {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  available: number;
  low_stock_threshold: number;
}

export interface DashboardSummary {
  revenue: {
    total_revenue: number | string;
    paid_orders: number;
    average_order_value: number | string;
  };
  orders: {
    total: number;
    awaiting_fulfillment: number;
    by_status: Record<string, number>;
  };
  catalog: {
    product_count: number;
    published_count: number;
    low_stock_count: number;
  };
  customers: {
    total: number;
  };
  recent_orders: DashboardRecentOrder[];
  low_stock: DashboardLowStock[];
}

export type DashboardResponse = ApiEnvelope<DashboardSummary>;

// ─── Discounts ────────────────────────────────────────────────
export type DiscountType = "flat" | "percent";

export interface AdminDiscount {
  id: number;
  name: string;
  discount_type: DiscountType;
  flat_amount: string | null;
  percentage: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  minimum_order_amount: string;
  first_order_only: boolean;
  is_auto_applied: boolean;
  is_stackable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminDiscountInput {
  name: string;
  discount_type: DiscountType;
  flat_amount: string | null;
  percentage: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  minimum_order_amount: string;
  first_order_only: boolean;
  is_auto_applied: boolean;
  is_stackable: boolean;
  is_active: boolean;
}

export interface AdminCoupon {
  id: number;
  discount: number;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminCouponInput {
  discount: number;
  code: string;
  is_active: boolean;
}

export interface AdminDiscountListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: string;
  discount_type?: string;
}

export type AdminDiscountListResponse = ApiEnvelope<PaginatedResponse<AdminDiscount>>;
export type AdminDiscountResponse = ApiEnvelope<AdminDiscount>;
export type AdminCouponListResponse = ApiEnvelope<PaginatedResponse<AdminCoupon>>;
export type AdminCouponResponse = ApiEnvelope<AdminCoupon>;
