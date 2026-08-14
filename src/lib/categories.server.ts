import "server-only";

import { Category, CategoryApiResponse } from "@/interface/Category";

// The public NEXT_PUBLIC_API_BASE_URL may not be reachable from inside the
// server's own network (e.g. firewalled or loopback-only in production) -
// prefer an internal Docker-network URL when one is configured.
const API_URL =
  process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

const FETCH_TIMEOUT_MS = 10000;

export async function getCategoriesServer(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories/`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load category");
  }

  const result: { success: boolean; data: Category } =
    await response.json();

  return result.data;
}
