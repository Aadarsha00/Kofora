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
    <div className="flex w-full flex-col items-start gap-5 md:flex-row md:gap-8">
      <div className="flex w-full shrink-0 flex-col gap-3 pt-1 md:w-55">
        <div>
          <p className="text-sm text-gray-500 font-normal tracking-wide">
            {category.name}
          </p>
          <h2 className="text-2xl md:text-[32px] font-serif font-normal text-black leading-tight mt-0.5">
            New Arrivals
          </h2>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-row">
          <Link
            href={`/collections/${category.slug}`}
            className="rounded-md bg-black px-4 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Shop All
          </Link>
          <Link
            href={`/collections/${category.slug}?sort=best-sellers`}
            className="rounded-md bg-black px-4 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Shop Best Sellers
          </Link>
        </div>
      </div>

      <div className="grid w-full min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-4">
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
    <section className="flex w-full flex-col gap-10 bg-[#F5F2EC] px-3 py-12 md:gap-14 md:px-14 md:py-16">
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
