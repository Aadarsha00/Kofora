import { FOOT_PRODUCT_GRID } from "@/data/HomeData"
import Image from "next/image"
import Link from "next/link"
export default function FootProductGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 w-full h-auto md:h-200">
      {FOOT_PRODUCT_GRID.map((cat) => (
        <Link
          key={cat.id}
          href={cat.href}
          className="relative overflow-hidden cursor-pointer group aspect-3/4 md:aspect-auto"
        >
          <Image
            src={cat.image}
            alt={cat.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <p className="text-xs tracking-widest mb-1 font-light">
              {cat.subtitle}
            </p>
            <h3 className="text-xl md:text-2xl font-bold tracking-widest group-hover:underline underline-offset-4">
              {cat.title}
            </h3>
          </div>
        </Link>
      ))}
    </section>
  )
}