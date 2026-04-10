"use client";
import { getProductsByGender, SockHeight } from "@/data/ProductsData";
import FilterSidebar from "@/ui/FilterSidebar";
import ProductGrid from "./ProductGrid";
import { Suspense } from "react";

interface CollectionViewProps {
  gender: string;
  searchParams: {
    sort_by?: string;
    "filter.p.m.custom.sub_category"?: string | string[];
    "filter.p.m.custom.gender1"?: string | string[];
    height?: string; 
  };
}

const SORT_OPTIONS = [
  { label: "Best selling", value: "best-selling" },
  { label: "Price, low to high", value: "price-asc" },
  { label: "Price, high to low", value: "price-desc" },
];

export default function CollectionView({ gender, searchParams }: CollectionViewProps) {
  let products = getProductsByGender(gender);

  // Apply gender cross-filter
  const genderFilter = searchParams["filter.p.m.custom.gender1"];
  const activeGenders: string[] = genderFilter
    ? Array.isArray(genderFilter) ? genderFilter : [genderFilter]
    : [];
  if (activeGenders.length > 0) {
    products = products.filter((p) =>
      activeGenders.map((g) => g.toLowerCase()).includes(p.gender.toLowerCase())
    );
  }

  // Derive available heights from all products (not filtered)
  const allProducts = getProductsByGender(gender);
  const availableHeights = [...new Set(allProducts.map((p) => p.height))] as SockHeight[];
  const prices = allProducts.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Apply height filter from FilterSidebar
  const heightFilter = searchParams["filter.p.m.custom.sub_category"];
  const activeHeights: string[] = heightFilter
    ? Array.isArray(heightFilter) ? heightFilter : [heightFilter]
    : [];
  if (activeHeights.length > 0) {
    products = products.filter((p) => activeHeights.includes(p.height));
  }

  // Apply height filter from SockLengthGuide 
  const heightFromGuide = searchParams.height;
  if (heightFromGuide) {
    products = products.filter((p) =>
      p.height.toLowerCase().replace(" ", "-") === heightFromGuide
    );
  }

  // Apply sort
  const sortBy = searchParams.sort_by || "best-selling";
  if (sortBy === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") products = [...products].sort((a, b) => b.price - a.price);

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10 items-start">
        <Suspense fallback={null}>
          <FilterSidebar
            availableHeights={availableHeights}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </Suspense>

        <div className="flex-1">
          <div className="mb-8 translate-x-15">
            <h2 className="text-lg font-semibold capitalize text-black mb-1">{gender}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Sort:</span>
              <select
                defaultValue={sortBy}
                className="border-none bg-transparent text-sm font-medium text-black focus:outline-none cursor-pointer"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort_by", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="ml-auto">
                Showing {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

<div className="translate-x-15">
  <ProductGrid products={products} />
</div>
        </div>
      </div>
    </section>
  );
}