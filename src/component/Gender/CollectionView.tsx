  import FilterSidebar from "@/ui/FilterSidebar";
  import MobileFilterBar from "@/ui/MobileFilterBar";
  import ProductGrid from "./ProductGrid";
  import { getProductsByGender } from "@/api/products.api";
  import { getCategories, getCategoryBySlug } from "@/api/category.api";
  import SortSelect from "./SortSelect";
  import {
    filterProductsByPrice,
    filterProductsByFamily,
    filterProductsByHeight,
    filterProductsByPurpose,
    filterProductsByStyle,
    getAvailableFamilyCategoriesFromProducts,
    getAvailableHeightCategoriesFromProducts,
    getAvailablePurposeCategoriesFromProducts,
    getAvailableStyleCategoriesFromProducts,
    getFamilyCategories,
    getHeightCategories,
    getProductPriceRange,
    getPurposeCategories,
    getStyleCategories,
  } from "@/lib/categoryFilters";
  import {
    getCategoryIdsBySlugs,
    isCapStyleSlug,
    isSockHeightSlug,
    isSockPurposeSlug,
    normalizeTaxonomySlugs,
  } from "@/lib/productTaxonomy";
  import { Product } from "@/interface/Product";
  import type { CategoryFilterOption } from "@/lib/categoryFilters";

  interface CollectionViewProps {
    categoryId: number;
    gender: string;
    collectionLabel?: string;
    searchParams: {
      sort_by?: string;
      sub_category?: string | string[];
      family?: string | string[];
      height?: string | string[];
      purpose?: string | string[];
      style?: string | string[];
      min_price?: string;
      max_price?: string;
    };
  }

  const SORT_OPTIONS = [
    { label: "Best selling", value: "best-selling" },
    { label: "Newest", value: "newest" },
    { label: "Price, low to high", value: "price-asc" },
    { label: "Price, high to low", value: "price-desc" },
  ];

  function getLowestVariantPrice(product: Product): number {
    const prices = product.variants
      .filter((variant) => variant.is_active)
      .map((variant) => Number(variant.price))
      .filter(Number.isFinite);

    return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
  }

  function getCreatedTime(product: Product): number {
    return new Date(product.created_at).getTime();
  }

  function sortProducts(products: Product[], sortBy: string): Product[] {
    if (sortBy === "best-selling") {
      return [...products].sort((a, b) => {
        const salesDiff = (b.sales_count ?? 0) - (a.sales_count ?? 0);
        if (salesDiff !== 0) return salesDiff;
        return getCreatedTime(b) - getCreatedTime(a);
      });
    }

    if (sortBy === "newest") {
      return [...products].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
    }

    if (sortBy === "price-asc") {
      return [...products].sort((a, b) => getLowestVariantPrice(a) - getLowestVariantPrice(b));
    }

    if (sortBy === "price-desc") {
      return [...products].sort((a, b) => getLowestVariantPrice(b) - getLowestVariantPrice(a));
    }

    return products;
  }

  function paramValues(value?: string | string[]) {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }

  function markUnavailableOptions(
    options: CategoryFilterOption[],
    availableOptions: CategoryFilterOption[],
    selectedValues: string[]
  ) {
    const availableValues = new Set(availableOptions.map((option) => option.value));
    const selected = new Set(selectedValues);

    return options.map((option) => ({
      ...option,
      disabled: !availableValues.has(option.value) && !selected.has(option.value),
    }));
  }

  export default async function CollectionView({
    gender,
    collectionLabel,
    searchParams,
  }: CollectionViewProps) {
    const sortBy = searchParams.sort_by || "best-selling";

    const legacySubCategories = paramValues(searchParams.sub_category);
    const selectedFamilies = normalizeTaxonomySlugs(paramValues(searchParams.family));
    const selectedHeights = normalizeTaxonomySlugs([
      ...paramValues(searchParams.height),
      ...legacySubCategories.filter(isSockHeightSlug),
    ]);
    const selectedPurposes = normalizeTaxonomySlugs([
      ...paramValues(searchParams.purpose),
      ...legacySubCategories.filter(isSockPurposeSlug),
    ]);
    const selectedStyles = normalizeTaxonomySlugs([
      ...paramValues(searchParams.style),
      ...legacySubCategories.filter(isCapStyleSlug),
    ]);
    const selectedMinPrice =
      searchParams.min_price !== undefined
        ? Number(searchParams.min_price)
        : undefined;

    const selectedMaxPrice =
      searchParams.max_price !== undefined
        ? Number(searchParams.max_price)
        : undefined;

    const [category, categories] = await Promise.all([
      getCategoryBySlug(gender),
      getCategories(),
    ]);

    const products = await getProductsByGender(category);

    const unfilteredPriceRange = getProductPriceRange(products);

    const familyFilteredProducts = filterProductsByFamily(
      products,
      categories,
      selectedFamilies
    );

    const heightFilteredProducts = filterProductsByHeight(
      familyFilteredProducts,
      categories,
      selectedHeights
    );

    const purposeFilteredProducts = filterProductsByPurpose(
      heightFilteredProducts,
      categories,
      selectedPurposes
    );

    const styleFilteredProducts = filterProductsByStyle(
      purposeFilteredProducts,
      categories,
      selectedStyles
    );

    // Other active filters determine availability, while the backend taxonomy
    // remains visible as a stable list of enabled and disabled options.
    const familyFacetProducts = filterProductsByStyle(
      filterProductsByPurpose(
        filterProductsByHeight(products, categories, selectedHeights),
        categories,
        selectedPurposes
      ),
      categories,
      selectedStyles
    );
    const heightFacetProducts = filterProductsByStyle(
      filterProductsByPurpose(familyFilteredProducts, categories, selectedPurposes),
      categories,
      selectedStyles
    );
    const collectionFacetProducts = filterProductsByStyle(
      heightFilteredProducts,
      categories,
      selectedStyles
    );
    const enabledFamilies = getAvailableFamilyCategoriesFromProducts(
      familyFacetProducts,
      categories
    );
    const enabledHeights = getAvailableHeightCategoriesFromProducts(
      heightFacetProducts,
      categories
    );
    const enabledPurposes = getAvailablePurposeCategoriesFromProducts(
      collectionFacetProducts,
      categories
    );
    const enabledStyles = getAvailableStyleCategoriesFromProducts(
      purposeFilteredProducts,
      categories
    );
    const socksCategoryIds = new Set(getCategoryIdsBySlugs(categories, ["socks"]));
    const capsCategoryIds = new Set(getCategoryIdsBySlugs(categories, ["caps"]));
    const hasSockProducts = products.some((product) =>
      product.categories.some((categoryId) => socksCategoryIds.has(categoryId))
    );
    const hasCapProducts = products.some((product) =>
      product.categories.some((categoryId) => capsCategoryIds.has(categoryId))
    );
    const isAudienceCollection = category.taxonomy_group === "audience";
    const familyOptions = markUnavailableOptions(
      getFamilyCategories(categories),
      enabledFamilies,
      selectedFamilies
    );
    const heightOptions =
      isAudienceCollection || category.slug === "socks" || hasSockProducts
        ? markUnavailableOptions(getHeightCategories(categories), enabledHeights, selectedHeights)
        : [];
    const collectionOptions = markUnavailableOptions(
      getPurposeCategories(categories),
      enabledPurposes,
      selectedPurposes
    );
    const styleOptions =
      isAudienceCollection || category.slug === "caps" || hasCapProducts
        ? markUnavailableOptions(getStyleCategories(categories), enabledStyles, selectedStyles)
        : [];

    const fullyFilteredProducts = filterProductsByPrice(
      styleFilteredProducts,
      selectedMinPrice,
      selectedMaxPrice
    );
    const sortedProducts = sortProducts(fullyFilteredProducts, sortBy);

    return (
      <section className="w-full bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10 lg:flex-row lg:gap-10 lg:items-start">
          <FilterSidebar
            availableFamilies={familyOptions}
            availableHeights={heightOptions}
            availablePurposes={collectionOptions}
            availableStyles={styleOptions}
            minPrice={unfilteredPriceRange.minPrice}
            maxPrice={unfilteredPriceRange.maxPrice}
          />

          <div className="min-w-0 flex-1">
            <MobileFilterBar
              availableFamilies={familyOptions}
              availableHeights={heightOptions}
              availablePurposes={collectionOptions}
              availableStyles={styleOptions}
              minPrice={unfilteredPriceRange.minPrice}
              maxPrice={unfilteredPriceRange.maxPrice}
              resultCount={sortedProducts.length}
              sortOptions={SORT_OPTIONS}
              currentSort={sortBy}
            />

            <div className="mb-6 md:mb-8">
              <h2 className="text-lg font-semibold capitalize text-black mb-1">
                {collectionLabel ?? gender}
              </h2>

              {/* Item count left, sort right — matching the Bombas collection filter bar. */}
              <div className="mt-4 hidden flex-row items-center justify-between gap-4 lg:flex">
                <span className="text-sm font-medium leading-tight text-gray-700">
                  {sortedProducts.length} Item{sortedProducts.length !== 1 ? "s" : ""}
                </span>

                <div className="flex items-center whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                  <span>Sort:&nbsp;</span>
                  <SortSelect sortOptions={SORT_OPTIONS} currentSort={sortBy} />
                </div>
              </div>
            </div>

            <div>
              <ProductGrid products={sortedProducts} gender={gender} />
            </div>
          </div>
        </div>
      </section>
    );
  }
