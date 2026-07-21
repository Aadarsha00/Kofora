"use client"

import { useCategories } from "@/hooks/useCategories"
import { COLLECTION_CATEGORIES, HEIGHT_CATEGORIES } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"

type RailKind = "collection" | "height"

export default function TaxonomyRail({
  kind,
  images,
}: {
  kind: RailKind
  images?: SiteImageMap
}) {
  const { data: categories, isLoading, isError } = useCategories()
  const visuals = kind === "collection" ? COLLECTION_CATEGORIES : HEIGHT_CATEGORIES
  const taxonomyGroup = kind === "collection" ? "purpose" : "height"
  const title = kind === "collection" ? "Shop by Collection" : "Shop by Height"
  const isCollection = kind === "collection"
  const visualBySlug = new Map(visuals.map((visual) => [visual.slug, visual]))
  const socks = categories?.find((category) => category.slug === "socks")
  const backendItems = (socks?.children ?? [])
    .filter((category) => category.is_active && category.taxonomy_group === taxonomyGroup)
    .sort((a, b) => a.sort_order - b.sort_order)

  const items = isLoading || isError
    ? visuals.map((visual, index) => ({
        id: -(index + 1),
        name: visual.label,
        slug: visual.slug,
        image: null,
      }))
    : backendItems

  if (!isLoading && !isError && items.length === 0) return null

  return (
    <section
      className={`w-full bg-[#fdfcf6] ${isCollection ? "py-6" : "py-12 md:py-16"}`}
      aria-label={title}
    >
      <div className="mx-auto max-w-[1520px] px-6 md:px-12">
        {!isCollection && (
          <div className="mx-auto mb-6 flex max-w-[1424px] flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5 md:mb-8">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">Find your sock length</p>
              <h2 className="text-2xl font-black uppercase leading-none text-black md:text-4xl">
                {title}
              </h2>
            </div>
            <Link
              href="/collections/socks"
              className="shrink-0 border-b border-black pb-0.5 text-xs font-bold uppercase tracking-wider text-black hover:opacity-60 md:text-sm"
            >
              Shop all socks
            </Link>
          </div>
        )}

        <div
          className={`mx-auto flex w-full max-w-[1424px] snap-x snap-mandatory overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isCollection ? "gap-[14px] md:gap-[26px]" : "gap-4 md:gap-8"
          }`}
        >
          {items.map((item) => {
            const visual = visualBySlug.get(item.slug)
            const imageKey = visual?.imageKey ?? `home-${kind}-${item.slug}`
            const image = item.image || pickImage(images, imageKey, visual?.image || "/hero.webp")

            return (
              <Link
                key={item.id}
                href={`/collections/${item.slug}`}
                className={`group relative shrink-0 snap-start overflow-hidden rounded-md bg-[#efefed] ${
                  isCollection
                    ? "min-w-[calc((100%_-_14px)/2)] md:min-w-[calc((100%_-_78px)/4)]"
                    : "min-w-[calc((100%_-_16px)/2)] md:min-w-[calc((100%_-_64px)/3)] lg:min-w-[calc((100%_-_160px)/6)]"
                }`}
              >
                <div className={`relative ${isCollection ? "aspect-[287/292]" : "aspect-[7/8]"}`}>
                  <Image
                    src={image}
                    alt={item.name}
                    fill
                    sizes={
                      isCollection
                        ? "(max-width: 767px) 50vw, 25vw"
                        : "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 17vw"
                    }
                    className="object-cover"
                  />
                  {isCollection ? (
                    <h3 className="absolute inset-0 flex items-center justify-center px-3 text-center text-[clamp(18px,4.6vw,32px)] font-black uppercase leading-[0.8] text-white underline-offset-[0.15em] [text-shadow:0_1px_5px_rgb(0_0_0/0.35)] group-hover:underline md:text-[clamp(17px,2vw,40px)] lg:text-[clamp(23px,2.4vw,40px)]">
                      {item.name}
                    </h3>
                  ) : (
                    <h3 className="absolute inset-x-2 bottom-2.5 text-center text-base font-bold leading-none text-white underline-offset-[0.15em] [text-shadow:0_1px_4px_rgb(0_0_0/0.55)] group-hover:underline">
                      {item.name}
                    </h3>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
