export interface ICartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  variant?: string;
  quantity: number;
  image: string;
}

export interface ICartStore {
  isOpen: boolean;
  items: ICartItem[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: ICartItem) => void;
  removeItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  clearCart: () => void;
}

export interface AddToCartRequest {
  variant_id: number;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyCouponRequest {
  coupon_code: string;
}

export interface SetShippingMethodRequest {
  shipping_method_id: number;
}

export interface SetAddressRequest {
  address_id: number;
}

// ─── BACKEND API RESPONSE TYPES ───────────────────────────────
export interface ProductVariant {
  id: number;
  product_id?: number;
  product_name?: string;
  product_slug?: string;
  sku: string;
  title: string;
  size: string;
  color: string;
  price: string;
  stock_quantity: number;
}

export interface CartVariantItem {
  id: number;
  variant: ProductVariant;
  quantity: number;
}

export interface CartBundleItem {
  id: number;
  bundle: {
    id: number;
    name: string;
    price: string;
  };
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Cart {
  id: number;
  currency: string;
  shipping_address: number | null;
  billing_address: number | null;
  shipping_method: number | null;
  applied_coupon: string | null;
  applied_discount_claim: {
    claim_token: string;
    email: string;
    status: string;
    expires_at: string;
  } | null;
  variant_items: CartVariantItem[];
  bundle_items: CartBundleItem[];
  totals: CartTotals;
  is_abandoned: boolean;
  abandoned_at: string | null;
  merged_count?: number;
  merged_variant_ids?: number[];
  skipped_variant_ids?: number[];
  capped_variant_ids?: number[];
}

// ─── API ENVELOPE ─────────────────────────────────────────────
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: null | unknown;
}

export type CartApiResponse = ApiEnvelope<Cart>;

// ─── CART ERROR RESPONSE ──────────────────────────────────────
export interface CartErrorResponse {
  success: false;
  message: string;
  data: null;
  errors: Record<string, string[]> | string;
}

// ─── CART STATE FOR UI ────────────────────────────────────────
export interface CartState {
  data: Cart | null;
  isLoading: boolean;
  isError: boolean;
  error: CartErrorResponse | null;
}
