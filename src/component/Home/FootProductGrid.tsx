import { FOOT_PRODUCT_GRID } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"
export default function FootProductGrid({ images }: { images?: SiteImageMap }) {
  return (
    <section className="w-full bg-white px-4 py-12 md:px-14 md:py-16">
      <div className="mb-6 md:mb-8">
        <p className="mb-1 text-sm font-medium text-gray-500">More to explore</p>
        <h2 className="text-2xl font-black uppercase leading-none text-black md:text-4xl">
          Comfort, Your Way
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-6">
        {FOOT_PRODUCT_GRID.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-[#efefed]"
          >
            <Image
              src={pickImage(images, cat.imageKey, cat.image)}
              alt={cat.title}
              fill
              sizes="(max-width: 639px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white md:px-6">
              <div>
                <p className="mb-1 text-xs font-medium tracking-wide">{cat.subtitle}</p>
                <h3 className="text-xl font-black uppercase group-hover:underline md:text-2xl">
                  {cat.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
