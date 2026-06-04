import { Category } from "@/interface/Category";
import { Product } from "@/interface/Product";
import { AUDIENCE_SLUGS } from "@/lib/productTaxonomy";

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function categoryMatches(category: Pick<Category, "name" | "slug">, query: string) {
  const needle = normalizeSearchText(query);
  if (!needle) return false;

  const haystacks = [category.name, category.slug].map(normalizeSearchText);
  return haystacks.some((value) => {
    const tokens = value.split(" ").filter(Boolean);
    if (value === needle) return true;
    if (tokens.includes(needle)) return true;
    if (tokens.includes(`${needle}s`)) return true;
    if (needle.endsWith("s") && tokens.includes(needle.slice(0, -1))) return true;
    if (needle.length < 4) return false;
    return value.includes(needle) || needle.includes(value);
  });
}

export function getMatchedCategoryIds(categories: Category[] | undefined, query: string) {
  if (!categories?.length) return [];

  const ids = new Set<number>();

  categories.forEach((category) => {
    const rootMatched = categoryMatches(category, query);

    if (rootMatched) {
      ids.add(category.id);
      category.children.forEach((child) => ids.add(child.id));
      return;
    }

    category.children.forEach((child) => {
      if (categoryMatches(child, query)) {
        ids.add(child.id);
      }
    });
  });

  return Array.from(ids);
}

export function getMatchedCategories(categories: Category[] | undefined, query: string) {
  if (!categories?.length) return [];

  return categories.filter((category) => {
    if (categoryMatches(category, query)) return true;
    return category.children.some((child) => categoryMatches(child, query));
  });
}

export function getProductGender(product: Product, categories: Category[] | undefined) {
  if (!categories?.length) return "women";

  const productCategoryIds = new Set(product.categories);
  const rootCategories = categories.filter((category) => category.parent === null);
  const audienceCategories = rootCategories.filter((category) =>
    (AUDIENCE_SLUGS as readonly string[]).includes(category.slug)
  );

  const directAudience = audienceCategories.find((category) => productCategoryIds.has(category.id));
  if (directAudience) return directAudience.slug;

  const childMatch = audienceCategories.find((category) =>
    category.children.some((child) => productCategoryIds.has(child.id))
  );

  if (childMatch) return childMatch.slug;

  const directRoot = rootCategories.find((category) => productCategoryIds.has(category.id));
  return directRoot?.slug ?? "women";
}
