/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CategoryChild {
  id: number;
  parent: string | null;
  name: string;
  slug: string;
  taxonomy_group: TaxonomyGroup | "";
  description: string;
  is_active: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  image?: string | null;
  children?: CategoryChild[];
}

export type TaxonomyGroup = "product_family" | "audience" | "height" | "purpose" | "style";

export interface Category {
  id: number;
  parent: string | null;
  name: string;
  slug: string;
  taxonomy_group: TaxonomyGroup | "";
  description: string;
  is_active: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  children: CategoryChild[];
  image?: string | null;
}

export interface PaginatedCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: PaginatedCategoryResponse;
  errors: null | any;
}
