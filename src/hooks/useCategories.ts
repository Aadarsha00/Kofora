import { useQuery } from "@tanstack/react-query";
import { getCategories, getCategoryBySlug } from "../api/category.api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["categories", slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  });
};