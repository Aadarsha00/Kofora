import api from "@/axios/api.axios";
import { Category, CategoryApiResponse, TaxonomyGroup } from "@/interface/Category";
import { getApiErrorMessage } from "@/lib/apiError";

export interface CategoryInput {
  parent?: string | null;
  name: string;
  slug: string;
  taxonomy_group: TaxonomyGroup;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
}

function throwApiError(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback));
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<CategoryApiResponse>("/categories/");
    return response.data.data.results;
  } catch (error: unknown) {
    throwApiError(error, "Failed to load categories");
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    const response = await api.get<{ success: boolean; data: Category }>(
      `/categories/${slug}/`
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to load category");
  }
};

export const createCategory = async (payload: CategoryInput): Promise<Category> => {
  try {
    const response = await api.post<{ success: boolean; data: Category }>("/categories/", payload);
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to create category");
  }
};

export const updateCategory = async (
  slug: string,
  payload: Partial<CategoryInput>
): Promise<Category> => {
  try {
    const response = await api.patch<{ success: boolean; data: Category }>(
      `/categories/${slug}/`,
      payload
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to update category");
  }
};
