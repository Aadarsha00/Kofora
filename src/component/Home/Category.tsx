import { CATEGORY_BANNERS } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"


export default function CategoryBanner({ images }: { images?: SiteImageMap }) {
  return (
    <section className="grid w-full grid-cols-2 gap-1 bg-white sm:grid-cols-3 sm:gap-0">
      {CATEGORY_BANNERS.map((cat, index) => (
        <Link
          key={cat.label}
          href={cat.href}
          className={`group relative overflow-hidden bg-[#f4f1ec] ${
            index === 2 ? "col-span-2 aspect-[2/1] sm:col-span-1" : "aspect-[4/5]"
          } sm:aspect-auto sm:h-60`}
        >
          <Image
            src={pickImage(images, cat.imageKey, cat.image)}
            alt={cat.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/20" />
          <span className="absolute inset-0 flex items-center justify-center text-center text-base font-bold tracking-widest text-white underline-offset-4 group-hover:underline">
            {cat.label}
          </span>
          <div className="absolute right-0 top-0 hidden h-full w-px bg-white/40 sm:block" />
        </Link>
      ))}
    </section>
  )
}
