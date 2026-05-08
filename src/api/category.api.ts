/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import { Category, CategoryApiResponse } from "@/interface/Category";


export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<CategoryApiResponse>("/categories/");
    return response.data.data.results;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    const response = await api.get<{ success: boolean; data: Category }>(
      `/categories/${slug}/`
    );
    return response.data.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};