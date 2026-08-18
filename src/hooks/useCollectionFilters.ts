"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { CategoryFilterOption } from "@/lib/categoryFilters";
import { normalizeTaxonomySlug } from "@/lib/productTaxonomy";

export const PARAMS = {
  subCategory: "sub_category",
  family: "family",
  height: "height",
  purpose: "purpose",
  style: "style",
  minPrice: "min_price",
  maxPrice: "max_price",
  sortBy: "sort_by",
} as const;

export interface FilterGroup {
  /** Query param this group writes to. */
  key: string;
  title: string;
  options: CategoryFilterOption[];
  activeValues: string[];
}

interface UseCollectionFiltersInput {
  availableFamilies: CategoryFilterOption[];
  availableHeights: CategoryFilterOption[];
  availablePurposes: CategoryFilterOption[];
  availableStyles: CategoryFilterOption[];
  minPrice: number;
  maxPrice: number;
}

function parsePriceParam(value: string | null, fallback: number, min: number, max: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Collection filter state, read from and written back to the URL.
 *
 * Shared by the desktop sidebar and the mobile chip bar so both stay in sync —
 * there is no local selection state, the query string is the single source of truth.
 */
export function useCollectionFilters({
  availableFamilies,
  availableHeights,
  availablePurposes,
  availableStyles,
  minPrice,
  maxPrice,
}: UseCollectionFiltersInput) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const legacySubCategories = useMemo(
    () => searchParams.getAll(PARAMS.subCategory),
    [searchParams]
  );

  const familyValues = useMemo(
    () => new Set(availableFamilies.map((item) => item.value)),
    [availableFamilies]
  );
  const heightValues = useMemo(
    () => new Set(availableHeights.map((item) => item.value)),
    [availableHeights]
  );
  const purposeValues = useMemo(
    () => new Set(availablePurposes.map((item) => item.value)),
    [availablePurposes]
  );
  const styleValues = useMemo(
    () => new Set(availableStyles.map((item) => item.value)),
    [availableStyles]
  );

  const activeFamilies = useMemo(
    () =>
      Array.from(
        new Set(
          searchParams
            .getAll(PARAMS.family)
            .map(normalizeTaxonomySlug)
            .filter((value) => familyValues.has(value))
        )
      ),
    [familyValues, searchParams]
  );

  const activeHeights = useMemo(
    () =>
      Array.from(
        new Set([
          ...searchParams.getAll(PARAMS.height).map(normalizeTaxonomySlug),
          ...legacySubCategories
            .map(normalizeTaxonomySlug)
            .filter((value) => heightValues.has(value)),
        ])
      ),
    [heightValues, legacySubCategories, searchParams]
  );

  const activePurposes = useMemo(
    () =>
      Array.from(
        new Set([
          ...searchParams.getAll(PARAMS.purpose).map(normalizeTaxonomySlug),
          ...legacySubCategories
            .map(normalizeTaxonomySlug)
            .filter((value) => purposeValues.has(value)),
        ])
      ),
    [legacySubCategories, purposeValues, searchParams]
  );

  const activeStyles = useMemo(
    () =>
      Array.from(
        new Set([
          ...searchParams.getAll(PARAMS.style).map(normalizeTaxonomySlug),
          ...legacySubCategories
            .map(normalizeTaxonomySlug)
            .filter((value) => styleValues.has(value)),
        ])
      ),
    [legacySubCategories, styleValues, searchParams]
  );

  const rawMinPrice = parsePriceParam(searchParams.get(PARAMS.minPrice), minPrice, minPrice, maxPrice);
  const rawMaxPrice = parsePriceParam(searchParams.get(PARAMS.maxPrice), maxPrice, minPrice, maxPrice);
  const activeMinPrice = Math.min(rawMinPrice, rawMaxPrice);
  const activeMaxPrice = Math.max(rawMinPrice, rawMaxPrice);
  const priceChanged = activeMinPrice !== minPrice || activeMaxPrice !== maxPrice;

  const groups = useMemo<FilterGroup[]>(
    () =>
      [
        { key: PARAMS.family, title: "Category", options: availableFamilies, activeValues: activeFamilies },
        { key: PARAMS.height, title: "Height", options: availableHeights, activeValues: activeHeights },
        { key: PARAMS.style, title: "Style", options: availableStyles, activeValues: activeStyles },
        { key: PARAMS.purpose, title: "Collection", options: availablePurposes, activeValues: activePurposes },
      ].filter((group) => group.options.length > 0),
    [
      activeFamilies,
      activeHeights,
      activePurposes,
      activeStyles,
      availableFamilies,
      availableHeights,
      availablePurposes,
      availableStyles,
    ]
  );

  const activeCount =
    activeFamilies.length +
    activeHeights.length +
    activeStyles.length +
    activePurposes.length +
    (priceChanged ? 1 : 0);

  const hasFilters = activeCount > 0 || legacySubCategories.length > 0;

  const buildQueryString = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const applyToggle = useCallback((params: URLSearchParams, key: string, value: string) => {
    const currentValues = params.getAll(key);
    const alreadySelected = currentValues.includes(value);

    params.delete(PARAMS.subCategory);
    params.delete(key);
    const nextValues = alreadySelected
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    nextValues.forEach((item) => params.append(key, item));
  }, []);

  const toggleValue = useCallback(
    (key: string, value: string) => {
      const url = buildQueryString((params) => applyToggle(params, key, value));
      router.replace(url, { scroll: false });
    },
    [applyToggle, buildQueryString, router]
  );

  const optionHref = useCallback(
    (key: string, value: string) => buildQueryString((params) => applyToggle(params, key, value)),
    [applyToggle, buildQueryString]
  );

  const commitPrice = useCallback(
    (nextMin: number, nextMax: number) => {
      const url = buildQueryString((params) => {
        params.delete(PARAMS.minPrice);
        params.delete(PARAMS.maxPrice);
        if (nextMin > minPrice) params.set(PARAMS.minPrice, String(nextMin));
        if (nextMax < maxPrice) params.set(PARAMS.maxPrice, String(nextMax));
      });

      router.replace(url, { scroll: false });
    },
    [buildQueryString, maxPrice, minPrice, router]
  );

  const setSort = useCallback(
    (value: string) => {
      const url = buildQueryString((params) => params.set(PARAMS.sortBy, value));
      router.replace(url, { scroll: false });
    },
    [buildQueryString, router]
  );

  const clearAll = useCallback(() => {
    const url = buildQueryString((params) => {
      params.delete(PARAMS.subCategory);
      params.delete(PARAMS.family);
      params.delete(PARAMS.height);
      params.delete(PARAMS.purpose);
      params.delete(PARAMS.style);
      params.delete(PARAMS.minPrice);
      params.delete(PARAMS.maxPrice);
    });

    router.replace(url, { scroll: false });
  }, [buildQueryString, router]);

  return {
    groups,
    activeCount,
    hasFilters,
    activeMinPrice,
    activeMaxPrice,
    priceChanged,
    toggleValue,
    optionHref,
    commitPrice,
    setSort,
    clearAll,
  };
}
