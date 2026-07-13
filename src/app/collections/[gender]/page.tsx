import HeroGender from "@/component/Gender/HeroGender";
import CollectionView from "@/component/Gender/CollectionView";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/api/category.api";
import {
  isCapStyleSlug,
  isSockHeightSlug,
  isSockPurposeSlug,
  normalizeTaxonomySlug,
} from "@/lib/productTaxonomy";

type CollectionSearchParams = {
  sort_by?: string;
  sub_category?: string | string[];
  height?: string | string[];
  purpose?: string | string[];
  style?: string | string[];
  min_price?: string;
  max_price?: string;
};

function appendTaxonomyParam(
  searchParams: CollectionSearchParams,
  key: "height" | "purpose" | "style",
  slug: string
): CollectionSearchParams {
  const current = searchParams[key];
  const values = Array.isArray(current) ? current : current ? [current] : [];
  if (values.some((value) => normalizeTaxonomySlug(value) === slug)) {
    return searchParams;
  }
  return {
    ...searchParams,
    [key]: [...values, slug],
  };
}

function resolveCollectionRoute(
  slug: string,
  searchParams: CollectionSearchParams
) {
  const normalizedSlug = normalizeTaxonomySlug(slug);
  if (isSockHeightSlug(normalizedSlug)) {
    return {
      collectionSlug: "socks",
      searchParams: appendTaxonomyParam(searchParams, "height", normalizedSlug),
    };
  }
  if (isSockPurposeSlug(normalizedSlug)) {
    return {
      collectionSlug: "socks",
      searchParams: appendTaxonomyParam(searchParams, "purpose", normalizedSlug),
    };
  }
  if (isCapStyleSlug(normalizedSlug)) {
    return {
      collectionSlug: "caps",
      searchParams: appendTaxonomyParam(searchParams, "style", normalizedSlug),
    };
  }
  return {
    collectionSlug: slug,
    searchParams,
  };
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.flatMap((category) => [
      { gender: category.slug },
      ...category.children.map((child) => ({ gender: child.slug })),
    ]);
  } catch {
    // API unreachable at build time (e.g. Docker build stage) —
    // fall back to on-demand rendering for these routes instead of failing the build.
    return [];
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string }>;
  searchParams: Promise<CollectionSearchParams>;
}) {
  const { gender } = await params;
  const resolvedSearchParams = await searchParams;
  const route = resolveCollectionRoute(gender, resolvedSearchParams);
  let category;
  try {
    category = await getCategoryBySlug(route.collectionSlug);
  } catch {
    notFound();
  }
  const heroCategory =
    route.collectionSlug === gender
      ? category
      : await getCategoryBySlug(gender).catch(() => category);
  return (
    <main>
      <HeroGender category={heroCategory} />
      <CollectionView
        categoryId={category.id}
        gender={route.collectionSlug}
        collectionLabel={heroCategory.name}
        searchParams={route.searchParams}
      />
    </main>
  );
}
