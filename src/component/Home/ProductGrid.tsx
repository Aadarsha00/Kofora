import { PRODUCT_GRID_ITEMS } from "@/data/HomeData"
import Image from "next/image"
import Link from "next/link"


export default function ProductGrid() {
  return (
    <section className="w-full grid grid-cols-2 md:grid-cols-4">
      {PRODUCT_GRID_ITEMS.map((product) => (
        <Link
          key={product.id}
          href={product.href}
          className="relative aspect-3/4 bg-[#D9D9D9] overflow-hidden group cursor-pointer"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <p className="text-white text-xs md:text-sm font-semibold tracking-[0.2em] uppercase border-b border-transparent group-hover:border-white transition-all duration-300">
              {product.name}
            </p>
          </div>
        </Link>
      ))}
    </section>
  )
}
