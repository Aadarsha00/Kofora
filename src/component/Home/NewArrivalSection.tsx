"use client"

import { useCategories } from "@/hooks/useCategories"
import { useNewArrivalsByCategory } from "@/hooks/useProducts"
import { Category } from "@/interface/Category"
import { Product } from "@/interface/Product"
import ProductCard from "@/ui/ProductCard"
import ProductRowSkeleton from "@/ui/ProductSkeletonRow"
import Link from "next/link"

const NEW_ARRIVALS_SLUGS = ["socks", "caps"]

function ProductRow({
  category,
  products,
}: {
  category: Category
  products: Product[]
}) {
  return (
    <section className="px-4 py-12 md:px-14 md:py-16">
      <div className="flex w-full flex-col items-start gap-8 md:flex-row md:gap-10">
        <div className="flex w-full shrink-0 flex-col items-start gap-4 md:w-56 md:gap-5">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500">{category.name}</p>
            <h2 className="text-3xl font-black leading-none text-black md:text-4xl">
              New Arrivals
            </h2>
          </div>
          <div className="flex shrink-0 flex-row gap-2 md:flex-col">
            <Link
              href={`/collections/${category.slug}`}
              className="rounded-md bg-[#253E38] px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#1a2e28] md:text-xs"
            >
              Shop All
            </Link>
            <Link
              href={`/collections/${category.slug}?sort_by=best-selling`}
              className="rounded-md border border-black px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white md:text-xs"
            >
              Best Sellers
            </Link>
          </div>
        </div>

        <div className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:flex-1 md:grid-cols-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <div key={product.id} className="min-w-[74vw] snap-start sm:min-w-[43vw] md:min-w-0">
              <ProductCard product={product} gender={category.slug} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductRowWithData({ category }: { category: Category }) {
  const { data: products, isLoading, isError } = useNewArrivalsByCategory(category)

  if (isLoading) {
    return (
      <section className="px-4 py-12 md:px-14 md:py-16">
        <ProductRowSkeleton />
      </section>
    )
  }
  if (isError || !products?.length) return null

  return <ProductRow category={category} products={products} />
}

export default function NewArrivalsSection() {
  const { data: categories, isLoading, isError } = useCategories()
  const rows = categories
    ?.filter((category) => NEW_ARRIVALS_SLUGS.includes(category.slug))
    .sort((a, b) => a.sort_order - b.sort_order) ?? []

  return (
    <div className="w-full bg-white">
      {isError && (
        <p className="px-4 py-12 text-center text-sm text-gray-500">
          Products are unavailable right now.
        </p>
      )}

      {isLoading && (
        <section className="px-4 py-12 md:px-14 md:py-16">
          <ProductRowSkeleton />
        </section>
      )}

      {!isLoading && !isError && rows.map((category) => (
        <ProductRowWithData key={category.id} category={category} />
      ))}
    </div>
  )
}
