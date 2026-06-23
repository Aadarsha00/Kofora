export interface ColorMixItem {
  name: string;
  hex?: string;
  quantity: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
  variant: number | null;
  variant_id: number | null;
}

export interface ProductVariant {
  id: number;
  sku: string;
  barcode: string;
  title: string;
  size: string;
  color: string;
  color_mix: ColorMixItem[];
  price: string;
  compare_at_price: string;
  cost_price: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_override: string | null;
  weight_grams: number;
}

export interface InternationalShipping {
  id: number;
  title: string;
  zone: number | null;
  zone_name: string | null;
  shipping_method: number | null;
  shipping_method_name: string | null;
  destination_country: string;
  destination_country_code: string;
  destination_region: string;
  service_name: string;
  carrier: string;
  delivery_time: string;
  handling_time: string;
  base_rate: string;
  additional_item_rate: string;
  free_shipping_threshold: string | null;
  currency: string;
  duties_paid_by: "customer" | "merchant" | "included";
  customs_notes: string;
  return_policy: string;
  restrictions: string;
  notes: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  short_description: string;
  full_description: string;
  is_active: boolean;
  is_featured: boolean;
  base_currency: string;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  categories: number[];
  international_shipping: number | null;
  international_shipping_details: InternationalShipping | null;
  sales_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: null | unknown;
}

export type PaginatedApiResponse = ApiEnvelope<PaginatedProductResponse>;
export type ProductApiResponse = ApiEnvelope<Product>;
