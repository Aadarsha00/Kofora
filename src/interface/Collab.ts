import { Product } from "./Product";

export interface Collab {
  id: number;
  name: string;
  slug: string;
  partner_name: string;
  tagline: string;
  description: string;
  logo: string | null;
  banner_image: string | null;
  hero_image: string | null;
  accent_color: string;
  text_color: string;
  cta_label: string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
  sort_order: number;
  is_live: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

/** The detail endpoint adds the full product list; the list endpoint omits it. */
export interface CollabDetail extends Collab {
  products: Product[];
}

export interface CollabInput {
  name: string;
  partner_name?: string;
  tagline?: string;
  description?: string;
  accent_color?: string;
  text_color?: string;
  cta_label?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
  sort_order: number;
  product_ids?: number[];
  logo?: File | null;
  banner_image?: File | null;
  hero_image?: File | null;
}
