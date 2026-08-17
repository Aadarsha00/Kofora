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
    // Mobile stacks the tiles two-up in a grid; from md up they sit on a single
    // flex row so any number of tiles shares the width evenly.
    <section
      aria-label="Shop by category"
      className="grid w-full grid-cols-2 gap-3 bg-white px-4 py-4 md:flex md:gap-6 md:px-14 md:py-6"
    >
      {visibleTiles.map((tile) => {
        const fallback = fallbackByKey.get(tile.key)
        const image = tile.image || fallback?.image || "/hero.webp"

        return (
          <Link
            key={tile.id}
            href={tile.href}
            className="group min-w-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:flex-1 md:basis-0"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[#f2f2f2] md:aspect-[2.7/1]">
              <Image
                src={image}
                alt={tile.alt_text}
                fill
                sizes="(max-width: 767px) 46vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/15" />
              <h2 className="absolute inset-0 flex items-center justify-center px-2 text-center text-sm font-bold uppercase leading-tight text-white underline-offset-4 group-hover:underline sm:text-base md:px-4 md:text-xl">
                {tile.title}
              </h2>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
