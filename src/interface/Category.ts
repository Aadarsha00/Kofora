/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CategoryChild {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  parent: number | null;
  name: string;
  slug: string;
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