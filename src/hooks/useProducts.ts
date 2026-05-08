import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  searchProducts,
  getProductBySlug,
} from "../api/products.api";
import { Category } from "@/interface/Category";
import { Product } from "@/interface/Product";
import api from "@/axios/api.axios";
import { PaginatedApiResponse } from "@/interface/Product";

const DEFAULT_PARAMS = "is_active=true&is_published=true&ordering=-created_at";

// ─── DATA NORMALIZATION ────────────────────────────────────────
// Converts orphaned images (with invalid variant_id) to general images
function normalizeProduct(product: Product): Product {
  if (!product.images || product.images.length === 0) return product;
  if (!product.variants || product.variants.length === 0) return product;

  const validVariantIds = new Set(product.variants.map((v) => v.id));

  const cleanedImages = product.images.map((img) => {
    if (img.variant_id === null || img.variant_id === undefined) {
      return img;
    }
    const isValid = validVariantIds.has(img.variant_id);
    if (isValid) {
      return img;
    }
    // Orphaned: convert to general image
    return {
      ...img,
      variant_id: null,
      variant: null,
    };
  });

  return {
    ...product,
    images: cleanedImages,
  };
}

function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const products = await getProducts();
      return normalizeProducts(products);
    },
  });
};

export const useNewArrivalsByCategory = (category: Category | undefined) => {
  return useQuery({
    queryKey: ["products", "new-arrivals", category?.id],
    enabled: !!category,
    queryFn: async (): Promise<Product[]> => {
      if (!category) return [];

      const ids = [category.id, ...category.children.map((c) => c.id)];

      const results = await Promise.all(
        ids.map((id) =>
          api
            .get<PaginatedApiResponse>(
              `/products/?${DEFAULT_PARAMS}&page_size=4&categories=${id}`
            )
            .then((r) => r.data.data.results ?? [])
        )
      );

      const merged = Array.from(
        new Map(results.flat().map((p) => [p.id, p])).values()
      ).slice(0, 4);

      return normalizeProducts(merged);
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const products = await getFeaturedProducts();
      return normalizeProducts(products);
    },
  });
};

export const useProductById = (id: number) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const product = await getProductById(id);
      return normalizeProduct(product);
    },
    enabled: !!id,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const products = await searchProducts(query);
      return normalizeProducts(products);
    },
    enabled: !!query,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: async () => {
      const product = await getProductBySlug(slug);
      return normalizeProduct(product);
    },
    enabled: !!slug,
  });
};