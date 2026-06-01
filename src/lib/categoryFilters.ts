import { Category } from "@/interface/Category";
import { Product } from "@/interface/Product";

export interface SubCategoryOption {
  id: number;
  label: string;
  value: string;
}

const GENDER_SLUGS = ["men", "women", "kids"] as const;

export function getGenderCategories(categories: Category[]): Category[] {
  return categories.filter((category) =>
    GENDER_SLUGS.includes(category.slug as (typeof GENDER_SLUGS)[number])
  );
}

export function getSocksCategory(categories: Category[]): Category | undefined {
  return categories.find((category) => category.slug === "socks");
}

export function getSubCategories(categories: Category[], genderSlug?: string): SubCategoryOption[] {
  const subCategories: SubCategoryOption[] = [];
  const seenIds = new Set<number>();

  // 1. Get subcategories under the gender (if provided)
  if (genderSlug) {
    const genderCategory = categories.find((c) => c.slug === genderSlug);
    if (genderCategory?.children) {
      genderCategory.children.forEach((child) => {
        subCategories.push({
          id: child.id,
          value: child.slug,
          label: child.name,
        });
        seenIds.add(child.id);
      });
    }
  }

  // 2. Always include universal sock types from Socks category
  const socksCategory = getSocksCategory(categories);
  if (socksCategory?.children) {
    socksCategory.children.forEach((child) => {
      if (!seenIds.has(child.id)) {
        subCategories.push({
          id: child.id,
          value: child.slug,
          label: child.name,
        });
        seenIds.add(child.id);
      }
    });
  }

  return subCategories;
}

export function getAvailableSubCategoriesFromProducts(
  products: Product[],
  categories: Category[],
  genderSlug?: string
): SubCategoryOption[] {
  const subCategories = getSubCategories(categories, genderSlug);

  const available = subCategories.filter((subCategory) =>
    products.some((product) => product.categories.includes(subCategory.id))
  );

  return available;
}

export function getProductSubCategory(
  product: Product,
  categories: Category[],
  genderSlug?: string
): SubCategoryOption | null {
  const subCategories = getSubCategories(categories, genderSlug);

  const match = subCategories.find((subCategory) =>
    product.categories.includes(subCategory.id)
  );
  
  return match ?? null;
}

export function filterProductsBySubCategory(
  products: Product[],
  categories: Category[],
  selectedSubCategories: string[],
  genderSlug?: string
): Product[] {
  if (!selectedSubCategories.length) {
    return products;
  }

  const filtered = products.filter((product) => {
    const subCategory = getProductSubCategory(product, categories, genderSlug);
    return subCategory ? selectedSubCategories.includes(subCategory.value) : false;
  });

  return filtered;
}

export function filterProductsByPrice(
  products: Product[],
  minPrice?: number,
  maxPrice?: number
): Product[] {
  return products.filter((product) => {
    const prices = product.variants
      .filter((variant) => variant.is_active && variant.available_quantity > 0)
      .map((variant) => parseFloat(variant.price));

    if (!prices.length) return true;

    return prices.some((price) => {
      if (typeof minPrice === "number" && price < minPrice) return false;
      if (typeof maxPrice === "number" && price >= maxPrice) return false;

      return true;
    });
  });
}

export function getProductPriceRange(products: Product[]) {
  const prices = products.flatMap((product) =>
    product.variants
      .filter((variant) => variant.is_active && variant.available_quantity > 0)
      .map((variant) => parseFloat(variant.price))
  );

  return {
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}
