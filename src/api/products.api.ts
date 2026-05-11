/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import {
  Product,
  PaginatedApiResponse,
  ProductApiResponse,
} from "@/interface/Product";

const DEFAULT_PARAMS = "is_active=true&is_published=true&ordering=-created_at";

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<PaginatedApiResponse>(
      `/products/?${DEFAULT_PARAMS}`
    );
    return response.data.data.results ?? [];
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getNewArrivalsByCategory = async (
  categoryId: number
): Promise<Product[]> => {
  try {
    const response = await api.get<PaginatedApiResponse>(
      `/products/?${DEFAULT_PARAMS}&page_size=4&categories=${categoryId}`
    );
    return response.data.data.results ?? [];
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<PaginatedApiResponse>(
      `/products/?${DEFAULT_PARAMS}&is_featured=true`
    );
    return response.data.data.results ?? [];
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get<ProductApiResponse>(`/products/${id}/`);
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await api.get<PaginatedApiResponse>(
      `/products/?${DEFAULT_PARAMS}&search=${encodeURIComponent(query)}`
    );
    return response.data.data.results ?? [];
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getProductsByCategoryIds = async (
  categoryIds: number[]
): Promise<Product[]> => {
  try {
    if (categoryIds.length === 0) return [];

    const results = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const response = await api.get<PaginatedApiResponse>(
          `/products/?${DEFAULT_PARAMS}&categories=${categoryId}`
        );
        return response.data.data.results ?? [];
      })
    );

    return Array.from(
      new Map(results.flat().map((product) => [product.id, product])).values()
    );
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getProductsByCategory = async (
  categorySlug: string
): Promise<Product[]> => {
  try {
    const response = await api.get<PaginatedApiResponse>(
      `/search/products/?${DEFAULT_PARAMS}&category=${categorySlug}`
    );
    return response.data.data.results ?? [];
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await api.get<PaginatedApiResponse>(
      `/products/?slug=${slug}&is_active=true&is_published=true`
    );
    const product = response.data.data.results?.[0];
    if (!product) throw new Error("Product not found");
    return product;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getProductsByGender = async (
  category: { id: number; slug: string; children: { id: number }[] },
  params?: {
    sort_by?: string;
  }
): Promise<Product[]> => {
  try {
    const ids = [category.id];

    const results = await Promise.all(
      ids.map(async (id) => {
        const searchParams = new URLSearchParams(DEFAULT_PARAMS);
        searchParams.set("categories", String(id));

        if (params?.sort_by === "price-asc") {
          searchParams.set("ordering", "price");
        }

        if (params?.sort_by === "price-desc") {
          searchParams.set("ordering", "-price");
        }

        const response = await api.get<PaginatedApiResponse>(
          `/products/?${searchParams.toString()}`
        );

        return response.data.data.results ?? [];
      })
    );

    return Array.from(
      new Map(results.flat().map((product) => [product.id, product])).values()
    );
  } catch (error: any) {
    throw error?.response?.data;
  }
};
