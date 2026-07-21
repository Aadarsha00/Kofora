import { DEFAULT_HOMEPAGE_TILES } from "@/data/HomeData"
import { HomepageTile } from "@/interface/HomepageTile"
import Image from "next/image"
import Link from "next/link"

const fallbackByKey = new Map(
  DEFAULT_HOMEPAGE_TILES.map((tile) => [tile.key, tile])
)

export default function CategoryBanner({
  tiles,
}: {
  tiles: HomepageTile[] | null
}) {
  const visibleTiles = tiles ?? DEFAULT_HOMEPAGE_TILES.map((tile, index) => ({
    id: -(index + 1),
    key: tile.key,
    title: tile.title,
    href: tile.href,
    image: tile.image,
    alt_text: `Shop ${tile.title}`,
    sort_order: (index + 1) * 10,
    is_active: true,
  }))

  if (visibleTiles.length === 0) return null

  return (
    <section
      aria-label="Shop by category"
      className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto bg-white px-4 py-4 [scrollbar-width:none] md:gap-6 md:px-14 md:py-6 [&::-webkit-scrollbar]:hidden"
    >
      {visibleTiles.map((tile) => {
        const fallback = fallbackByKey.get(tile.key)
        const image = tile.image || fallback?.image || "/hero.webp"

        return (
          <Link
            key={tile.id}
            href={tile.href}
            className="group min-w-[84%] flex-1 basis-0 snap-start focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:min-w-[220px]"
          >
            <div className="relative aspect-[2.7/1] overflow-hidden rounded-lg bg-[#f2f2f2]">
              <Image
                src={image}
                alt={tile.alt_text}
                fill
                sizes="(max-width: 639px) 84vw, (max-width: 1199px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/15" />
              <h2 className="absolute inset-0 flex items-center justify-center px-4 text-lg font-bold uppercase text-white underline-offset-4 group-hover:underline sm:text-xl">
                {tile.title}
              </h2>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
