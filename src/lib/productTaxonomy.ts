import { Category, TaxonomyGroup } from "@/interface/Category";
import { Product } from "@/interface/Product";

export const PRODUCT_FAMILY_SLUGS = ["socks"] as const;
export const AUDIENCE_SLUGS = ["men", "women", "kids", "unisex"] as const;
export const SOCK_HEIGHT_SLUGS = [
  "no-show",
  "ankle",
  "quarter",
  "crew-socks",
  "half-calf",
  "calf",
  "knee-high",
] as const;
export const SOCK_PURPOSE_SLUGS = ["casual", "formal", "sports", "compression"] as const;

const TAXONOMY_SLUG_ALIASES: Record<string, string> = {
  ankel: "ankle",
  crew: "crew-socks",
  formals: "formal",
};

export interface TaxonomyCategoryOption {
  id: number;
  label: string;
  value: string;
  parentSlug?: string;
  isActive?: boolean;
  taxonomyGroup?: TaxonomyGroup | "";
  sortOrder?: number;
}

export function normalizeTaxonomySlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return TAXONOMY_SLUG_ALIASES[normalized] ?? normalized;
}

export function normalizeTaxonomySlugs(slugs: string[]) {
  return Array.from(new Set(slugs.map(normalizeTaxonomySlug).filter(Boolean)));
}

export function isSockHeightSlug(slug: string) {
  return (SOCK_HEIGHT_SLUGS as readonly string[]).includes(normalizeTaxonomySlug(slug));
}

export function isSockPurposeSlug(slug: string) {
  return (SOCK_PURPOSE_SLUGS as readonly string[]).includes(normalizeTaxonomySlug(slug));
}

export function flattenCategories(categories: Category[] | undefined): TaxonomyCategoryOption[] {
  if (!categories?.length) return [];

  return categories.flatMap((category) => [
    {
      id: category.id,
      label: category.name,
      value: category.slug,
      taxonomyGroup: category.taxonomy_group,
      isActive: category.is_active,
      sortOrder: category.sort_order,
    },
    ...category.children.map((child) => ({
      id: child.id,
      label: child.name,
      value: child.slug,
      parentSlug: category.slug,
      taxonomyGroup: child.taxonomy_group,
      isActive: child.is_active,
      sortOrder: child.sort_order,
    })),
  ]);
}

export function getCategoryOptionsByGroup(
  categories: Category[] | undefined,
  group: TaxonomyGroup,
  fallbackSlugs: readonly string[] = []
): TaxonomyCategoryOption[] {
  const flatCategories = flattenCategories(categories).filter((category) => category.isActive !== false);
  const groupedOptions = flatCategories.filter((category) => category.taxonomyGroup === group);

  if (groupedOptions.length > 0) {
    return groupedOptions;
  }

  return getCategoryOptionsBySlugs(categories, fallbackSlugs).filter(
    (category) => category.isActive !== false
  );
}

export function getProductFamilyOptions(categories: Category[] | undefined) {
  return getCategoryOptionsByGroup(categories, "product_family", PRODUCT_FAMILY_SLUGS);
}

export function getAudienceOptions(categories: Category[] | undefined) {
  return getCategoryOptionsByGroup(categories, "audience", AUDIENCE_SLUGS);
}

export function getSockHeightOptions(categories: Category[] | undefined) {
  return getCategoryOptionsByGroup(categories, "height", SOCK_HEIGHT_SLUGS);
}

export function getSockPurposeOptions(categories: Category[] | undefined) {
  return getCategoryOptionsByGroup(categories, "purpose", SOCK_PURPOSE_SLUGS);
}

export function getCategoryOptionsBySlugs(
  categories: Category[] | undefined,
  slugs: readonly string[]
): TaxonomyCategoryOption[] {
  const flatCategories = flattenCategories(categories);

  return slugs
    .map((slug) => {
      const exactMatch = flatCategories.find((category) => category.value === slug);
      return exactMatch ?? flatCategories.find((category) => normalizeTaxonomySlug(category.value) === slug);
    })
    .filter((category): category is TaxonomyCategoryOption => Boolean(category));
}

export function getCategoryIdsBySlugs(categories: Category[] | undefined, slugs: readonly string[]) {
  return getCategoryOptionsBySlugs(categories, slugs).map((category) => category.id);
}

export function getAvailableCategoryOptionsFromProducts(
  products: Product[],
  categories: Category[],
  slugs: readonly string[]
): TaxonomyCategoryOption[] {
  const options = getCategoryOptionsBySlugs(categories, slugs);

  return options.filter((option) =>
    products.some((product) => product.categories.includes(option.id))
  );
}

export function filterProductsByCategorySlugs(
  products: Product[],
  categories: Category[],
  selectedSlugs: string[]
): Product[] {
  const normalizedSlugs = normalizeTaxonomySlugs(selectedSlugs);
  if (!normalizedSlugs.length) return products;

  const selectedIds = new Set(getCategoryIdsBySlugs(categories, normalizedSlugs));
  if (!selectedIds.size) return [];

  return products.filter((product) =>
    product.categories.some((categoryId) => selectedIds.has(categoryId))
  );
}

export function getTaxonomyValidationMessage(
  selectedCategoryIds: number[],
  categories: Category[] | undefined
) {
  const flatCategories = flattenCategories(categories);
  if (!flatCategories.length) return "Category data is still loading.";

  const selectedIds = new Set(selectedCategoryIds);
  const selectedSlugs = new Set(
    flatCategories
      .filter((category) => selectedIds.has(category.id))
      .map((category) => normalizeTaxonomySlug(category.value))
  );
  const selectedGroups = new Set(
    flatCategories
      .filter((category) => selectedIds.has(category.id) && category.taxonomyGroup)
      .map((category) => category.taxonomyGroup)
  );

  if (!selectedGroups.has("product_family") && ![...PRODUCT_FAMILY_SLUGS].some((slug) => selectedSlugs.has(slug))) {
    return "Choose a product family.";
  }

  if (!selectedGroups.has("audience") && ![...AUDIENCE_SLUGS].some((slug) => selectedSlugs.has(slug))) {
    return "Choose at least one audience.";
  }

  if (
    selectedSlugs.has("socks") &&
    !selectedGroups.has("height") &&
    ![...SOCK_HEIGHT_SLUGS].some((slug) => selectedSlugs.has(slug))
  ) {
    return "Choose a sock height.";
  }

  return "";
}
