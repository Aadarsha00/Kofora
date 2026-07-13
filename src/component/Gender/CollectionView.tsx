  import FilterSidebar from "@/ui/FilterSidebar";
  import ProductGrid from "./ProductGrid";
  import { getProductsByGender } from "@/api/products.api";
  import { getCategories, getCategoryBySlug } from "@/api/category.api";
  import SortSelect from "./SortSelect";
  import {
    filterProductsByPrice,
    filterProductsByHeight,
    filterProductsByPurpose,
    filterProductsByStyle,
    getAvailableHeightCategoriesFromProducts,
    getAvailablePurposeCategoriesFromProducts,
    getAvailableStyleCategoriesFromProducts,
    getProductPriceRange,
  } from "@/lib/categoryFilters";
  import {
    isCapStyleSlug,
    isSockHeightSlug,
    isSockPurposeSlug,
    normalizeTaxonomySlugs,
  } from "@/lib/productTaxonomy";
  import { Product } from "@/interface/Product";

  interface CollectionViewProps {
    categoryId: number;
    gender: string;
    collectionLabel?: string;
    searchParams: {
      sort_by?: string;
      sub_category?: string | string[];
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

  export default async function CollectionView({
    gender,
    collectionLabel,
    searchParams,
  }: CollectionViewProps) {
    const sortBy = searchParams.sort_by || "best-selling";

    const legacySubCategories = paramValues(searchParams.sub_category);
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

    // Only offer filters that match at least one product in this collection,
    // so sock filters don't show on the caps page and vice versa.
    const availableHeights = getAvailableHeightCategoriesFromProducts(products, categories);
    const availablePurposes = getAvailablePurposeCategoriesFromProducts(products, categories);
    const availableStyles = getAvailableStyleCategoriesFromProducts(products, categories);

    const unfilteredPriceRange = getProductPriceRange(products);

    const heightFilteredProducts = filterProductsByHeight(
      products,
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
            availableHeights={availableHeights}
            availablePurposes={availablePurposes}
            availableStyles={availableStyles}
            minPrice={unfilteredPriceRange.minPrice}
            maxPrice={unfilteredPriceRange.maxPrice}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg font-semibold capitalize text-black mb-1">
                {collectionLabel ?? gender}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Sort:</span>
                <SortSelect sortOptions={SORT_OPTIONS} currentSort={sortBy} />
                <span className="w-full sm:ml-auto sm:w-auto">
                  Showing {sortedProducts.length} product
                  {sortedProducts.length !== 1 ? "s" : ""}
                </span>
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
