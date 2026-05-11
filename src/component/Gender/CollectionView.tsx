  import FilterSidebar from "@/ui/FilterSidebar";
  import ProductGrid from "./ProductGrid";
  import { getProductsByGender } from "@/api/products.api";
  import { getCategories, getCategoryBySlug } from "@/api/category.api";
  import SortSelect from "./SortSelect";
  import {
    filterProductsBySubCategory,
    filterProductsByPrice,
    getAvailableSubCategoriesFromProducts,
    getProductPriceRange,
  } from "@/lib/categoryFilters";

  interface CollectionViewProps {
    categoryId: number;
    gender: string;
    searchParams: {
      sort_by?: string;
      sub_category?: string | string[];
      min_price?: string;
      max_price?: string;
    };
  }

  const SORT_OPTIONS = [
    { label: "Best selling", value: "best-selling" },
    { label: "Price, low to high", value: "price-asc" },
    { label: "Price, high to low", value: "price-desc" },
  ];

  export default async function CollectionView({
    gender,
    searchParams,
  }: CollectionViewProps) {
    console.log("🔍 CollectionView - gender:", gender);
    console.log("🔍 Raw searchParams:", searchParams);
    
    const sortBy = searchParams.sort_by || "best-selling";

    const selectedSubCategories = Array.isArray(searchParams.sub_category)
      ? searchParams.sub_category
      : searchParams.sub_category
      ? [searchParams.sub_category]
      : [];
    
    console.log("🔍 selectedSubCategories:", selectedSubCategories);

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

    console.log("📂 Category fetched:", {
      id: category?.id,
      name: category?.name,
      slug: category?.slug,
    });

    const products = await getProductsByGender(category, { sort_by: sortBy });

    console.log("📦 Products retrieved:", {
      count: products.length,
      gender,
    });

    if (products.length === 0) {
      console.log("⚠️ NO PRODUCTS FOUND FOR:", gender);
    }

    const availableSubCategories = getAvailableSubCategoriesFromProducts(
      products,
      categories,
      gender
    );

    const unfilteredPriceRange = getProductPriceRange(products);

    const subCategoryFilteredProducts = filterProductsBySubCategory(
      products,
      categories,
      selectedSubCategories,
      gender
    );

    console.log("📦 After SubCategory Filter:", {
      before: products.length,
      after: subCategoryFilteredProducts.length,
    });

    const fullyFilteredProducts = filterProductsByPrice(
      subCategoryFilteredProducts,
      selectedMinPrice,
      selectedMaxPrice
    );

    return (
      <section className="w-full bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10 lg:flex-row lg:gap-10 lg:items-start">
          <FilterSidebar
            availableSubCategories={availableSubCategories}
            minPrice={unfilteredPriceRange.minPrice}
            maxPrice={unfilteredPriceRange.maxPrice}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg font-semibold capitalize text-black mb-1">
                {gender}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Sort:</span>
                <SortSelect sortOptions={SORT_OPTIONS} currentSort={sortBy} />
                <span className="w-full sm:ml-auto sm:w-auto">
                  Showing {fullyFilteredProducts.length} product
                  {fullyFilteredProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div>
              <ProductGrid products={fullyFilteredProducts} gender={gender} />
            </div>
          </div>
        </div>
      </section>
    );
  }
