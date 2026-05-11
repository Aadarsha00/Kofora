"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchPageProducts } from "@/hooks/useProducts";
import ProductCard from "@/ui/ProductCard";
import { getMatchedCategories, getMatchedCategoryIds, getProductGender } from "@/lib/searchHelpers";

export default function SearchResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const { data: categories } = useCategories();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if ((searchParams.get("q")?.trim() ?? "") === debouncedQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  const matchedCategoryIds = useMemo(
    () => getMatchedCategoryIds(categories, debouncedQuery),
    [categories, debouncedQuery]
  );

  const matchedCategories = useMemo(
    () => getMatchedCategories(categories, debouncedQuery),
    [categories, debouncedQuery]
  );

  const {
    data: products,
    isLoading,
    isFetching,
    isError,
  } = useSearchPageProducts(debouncedQuery, matchedCategoryIds);

  const hasQuery = debouncedQuery.length > 0;
  const productCount = products?.length ?? 0;

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Search</p>
          <h1 className="text-3xl font-black uppercase leading-tight text-black md:text-5xl">
            Find Your Pair
          </h1>

          <form className="mt-5 max-w-2xl" onSubmit={(event) => event.preventDefault()}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search by product, style, or category"
              className="w-full border border-gray-300 px-4 py-4 text-base text-black outline-none focus:border-black"
            />
          </form>

          {hasQuery && (
            <p className="mt-3 text-sm text-gray-500">
              {isFetching ? "Searching..." : `Showing ${productCount} product${productCount === 1 ? "" : "s"}.`}
            </p>
          )}
        </div>

        {!hasQuery && (
          <div className="border border-gray-200 bg-gray-50 p-6">
            <p className="mb-4 text-sm text-gray-600">Search by category, sock length, color, or product name.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/search?q=women" className="bg-black px-5 py-3 text-sm font-semibold text-white">
                Women
              </Link>
              <Link href="/search?q=men" className="border border-black px-5 py-3 text-sm font-semibold text-black">
                Men
              </Link>
              <Link href="/search?q=kids" className="border border-black px-5 py-3 text-sm font-semibold text-black">
                Kids
              </Link>
            </div>
          </div>
        )}

        {hasQuery && matchedCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Category match</span>
            {matchedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="border border-gray-300 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-black"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {hasQuery && isLoading && <p className="py-16 text-center text-sm text-gray-500">Searching...</p>}

        {hasQuery && isError && (
          <p className="py-16 text-center text-sm text-red-600">
            Search failed. Please try again.
          </p>
        )}

        {hasQuery && !isLoading && !isError && productCount === 0 && (
          <div className="border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-lg font-semibold text-black">No products found</p>
            <p className="mt-2 text-sm text-gray-500">Try a different search term.</p>
          </div>
        )}

        {hasQuery && !isLoading && !isError && productCount > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {products!.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                gender={getProductGender(product, categories)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
