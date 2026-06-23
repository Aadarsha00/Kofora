import { ApiEnvelope } from "@/interface/cart";
import { OrderItem, OrderStatusHistory, PaginatedResponse } from "@/interface/checkout";
import { ColorMixItem, Product, ProductVariant } from "@/interface/Product";

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
  international_shipping: number | null;
}

export interface AdminVariantInput {
  product: number;
  sku: string;
  barcode?: string;
  title?: string;
  size: string;
  color: string;
  color_mix?: ColorMixItem[];
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
  is_primary: boolean;
}

export interface AdminUploadedImage {
  id: number;
  product: number;
  image: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
  variant_id: number | null;
}

export interface AdminImageUploadInput {
  product: number;
  image?: File;
  image_url?: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
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
export interface AdminInventoryVariant {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  sku: string;
  barcode: string;
  title: string;
  size: string;
  color: string;
  color_mix: ColorMixItem[];
  price: string;
  compare_at_price: string | null;
  cost_price: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_override: string | null;
  weight_grams: number | null;
}

export interface AdminInventoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  stock_status?: string;
  is_active?: string;
  ordering?: string;
}

export interface AdminInventoryAdjustment {
  id: number;
  variant: number;
  variant_sku: string;
  variant_title: string;
  variant_size: string;
  variant_color: string;
  product_id: number;
  product_name: string;
  quantity_delta: number;
  reason: string;
  reference: string;
  notes: string;
  adjusted_by: number | null;
  adjusted_by_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminInventoryAdjustmentInput {
  variant: number;
  quantity_delta: number;
  reason?: string;
  reference?: string;
  notes?: string;
}

export interface AdminInventoryAdjustmentListParams {
  page?: number;
  page_size?: number;
  search?: string;
  reason?: string;
  variant?: number;
  ordering?: string;
}

export type AdminInventoryListResponse = ApiEnvelope<PaginatedResponse<AdminInventoryVariant>>;
export type AdminInventoryAdjustmentListResponse = ApiEnvelope<PaginatedResponse<AdminInventoryAdjustment>>;
export type AdminInventoryAdjustmentResponse = ApiEnvelope<AdminInventoryAdjustment>;

export interface AdminCustomer {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  is_active: boolean;
  is_email_verified: boolean;
  marketing_opt_in: boolean;
  order_count: number;
  total_spend: string;
  last_order_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: string;
  is_email_verified?: string;
  marketing_opt_in?: string;
  ordering?: string;
}

export interface AdminCustomerStatusInput {
  is_active: boolean;
}

export type AdminCustomerListResponse = ApiEnvelope<PaginatedResponse<AdminCustomer>>;
export type AdminCustomerResponse = ApiEnvelope<AdminCustomer>;

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

export interface DashboardTrendPoint {
  date: string;
  revenue: number | string;
  orders: number;
}

export interface DashboardStatusBreakdown {
  status: string;
  label: string;
  count: number;
}

export interface DashboardInventoryHealth {
  healthy: number;
  low: number;
  out: number;
}

export interface DashboardSummary {
  revenue: {
    total_revenue: number | string;
    paid_orders: number;
    average_order_value: number | string;
    trend: DashboardTrendPoint[];
  };
  orders: {
    total: number;
    awaiting_fulfillment: number;
    by_status: Record<string, number>;
    status_breakdown: DashboardStatusBreakdown[];
  };
  catalog: {
    product_count: number;
    published_count: number;
    low_stock_count: number;
    inventory_health: DashboardInventoryHealth;
  };
  customers: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    marketing_opt_in: number;
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
