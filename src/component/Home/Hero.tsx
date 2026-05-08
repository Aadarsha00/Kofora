import { HERO_DATA } from "@/data/HomeData"
import Image from "next/image"
import Link from "next/link"


export default function Hero() {
  return (
    <section className="relative w-full h-[560px] md:h-140 overflow-hidden">
      <Image
        src={HERO_DATA.image}
        alt="Hero"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

      <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-18 flex flex-col gap-4 max-w-[90%] md:max-w-175">
        <h1 className="text-white font-black text-4xl md:text-[56px] leading-none tracking-tight uppercase">
          {HERO_DATA.title}
        </h1>
        <p className="text-white italic text-base md:text-lg font-light">
          {HERO_DATA.subtitle}
        </p>
        <div className="flex flex-row gap-4 mt-2 flex-wrap">
          {HERO_DATA.ctas.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className="bg-[#253E38] text-white font-bold text-sm tracking-widest px-6 py-3 hover:bg-[#1a2e28] transition-colors whitespace-nowrap"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}