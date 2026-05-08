"use client";

import { useCategories } from "@/hooks/useCategories";
import { useNewArrivalsByCategory } from "@/hooks/useProducts";
import ProductCard from "@/ui/ProductCard";
import Link from "next/link";
import { Category } from "@/interface/Category";
import { Product } from "@/interface/Product";
import ProductRowSkeleton from "@/ui/ProductSkeletonRow";

// ─── Product Row ───────────────────────────────────────────────
function ProductRow({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
      <div className="shrink-0 md:w-55 flex flex-col gap-3 pt-1">
        <div>
          <p className="text-sm text-gray-500 font-normal tracking-wide">
            {category.name}
          </p>
          <h2 className="text-2xl md:text-[32px] font-serif font-normal text-black leading-tight mt-0.5">
            New Arrivals
          </h2>
        </div>
        <div className="flex flex-row gap-2">
          <Link
            href={`/collections/women`}
            className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Shop All
          </Link>
          <Link
            href={`/collections/${category.slug}?sort=best-sellers`}
            className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Shop Best Sellers
          </Link>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} gender={category.slug} />
        ))}
      </div>
    </div>
  );
}

// ─── Product Row With Data ─────────────────────────────────────
function ProductRowWithData({ category }: { category: Category }) {
  const { data: products, isLoading, isError } = useNewArrivalsByCategory(category);
  console.log("products:", JSON.stringify(products, null, 2));

  if (isLoading) return <ProductRowSkeleton />;
  if (isError) return null;
  if (!products?.length) return null;

  return <ProductRow category={category} products={products} />;
}

// ─── ADD OR REMOVE SLUGS HERE TO CONTROL WHICH CATEGORIES SHOW ─
const NEW_ARRIVALS_SLUGS = ["women", "men"];

// ─── Main Section ──────────────────────────────────────────────
export default function NewArrivalsSection() {
  const { data: categories, isLoading, isError } = useCategories();

  console.log("[NewArrivals] all categories:", categories);

  const newArrivalCategories = categories?.filter(c =>
    NEW_ARRIVALS_SLUGS.includes(c.slug)
  ) ?? [];

  console.log("[NewArrivals] filtered categories:", newArrivalCategories);

  return (
    <section className="w-full bg-[#F5F2EC] py-12 md:py-16 px-6 md:px-14 flex flex-col gap-10 md:gap-14">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-black">
          BUILT FOR YOUR DAILY RHYTHM
        </h1>
        <p className="text-sm text-gray-500">
          Seamless essentials designed for all-day comfort.
        </p>
      </div>

      {isError && (
        <p className="text-center text-red-500 text-sm">
          Failed to load products. Please try again.
        </p>
      )}

      {isLoading && (
        <>
          <ProductRowSkeleton />
          <ProductRowSkeleton />
        </>
      )}

      {!isLoading && !isError && (
        <>
          {newArrivalCategories.map(category => (
            <ProductRowWithData key={category.id} category={category} />
          ))}
        </>
      )}
    </section>
  );
}