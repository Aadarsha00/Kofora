import "server-only";

import { Category, CategoryApiResponse } from "@/interface/Category";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getCategoriesServer(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories/`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("Failed to load categories");
  }

  const result: CategoryApiResponse = await response.json();
  return result.data.results;
}

export async function getCategoryBySlugServer(
  slug: string
): Promise<Category> {
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(slug)}/`,
    {
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load category");
  }

  const result: { success: boolean; data: Category } =
    await response.json();

  return result.data;
}
