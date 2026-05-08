import { CATEGORY_BANNERS } from "@/data/HomeData"
import Image from "next/image"
import Link from "next/link"


export default function CategoryBanner() {
  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-3 h-60">
      {CATEGORY_BANNERS.map((cat) => (
        <Link
          key={cat.label}
          href={cat.href}
          className="relative overflow-hidden group"
        >
          <Image
            src={cat.image}
            alt={cat.label}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base tracking-widest whitespace-nowrap group-hover:underline underline-offset-4">
            {cat.label}
          </span>
          <div className="absolute right-0 top-0 h-full w-px bg-white/40" />
        </Link>
      ))}
    </section>
  )
}