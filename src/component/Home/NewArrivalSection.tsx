import {  MENS_PRODUCTS, WOMENS_PRODUCTS } from "@/data/ProductsData";
import { Product } from "@/interface/Product";
import ProductCard from "@/ui/ProductCard";


function ProductRow({ gender, products }: { gender: string; products: Product[] }) {
  return (
    <div className="w-full flex flex-row gap-8 items-start">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 w-55 flex flex-col gap-3 pt-1">
        <div>
          <p className="text-sm text-gray-500 font-normal tracking-wide">{gender}</p>
          <h2 className="text-[32px] font-serif font-normal text-black leading-tight mt-0.5">
            New Arrivals
          </h2>
        </div>
        {/* Buttons side by side */}
        <div className="flex flex-row gap-2">
          <a
            href="#"
            className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Shop All
          </a>
          <a
            href="#"
            className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Shop Best Sellers
          </a>
        </div>
      </div>

      {/* ── Product Grid ────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-w-0 *:max-w-80">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function NewArrivalsSection() {
  return (
    <section className="w-full bg-[#F5F2EC] py-16 px-14 flex flex-col gap-14">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-4xl font-black uppercase tracking-widest text-black">
          BUILT FOR YOUR DAILY RHYTHM
        </h1>
        <p className="text-sm text-gray-500">
          Seamless essentials designed for all-day comfort.
        </p>
      </div>

      <ProductRow gender="Women" products={WOMENS_PRODUCTS} />
      <ProductRow gender="Men's" products={MENS_PRODUCTS} />
  

    </section>
  );
}