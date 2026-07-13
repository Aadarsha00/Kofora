import { HERO_DATA } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"


export default function Hero({ images }: { images?: SiteImageMap }) {
  return (
    <section className="relative h-[520px] w-full overflow-hidden md:h-140">
      <Image
        src={pickImage(images, HERO_DATA.imageKey, HERO_DATA.image)}
        alt="Hero"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent md:bg-gradient-to-r" />

      <div className="absolute inset-x-5 bottom-8 flex max-w-[92%] flex-col gap-4 md:inset-x-auto md:left-18 md:top-1/2 md:max-w-175 md:-translate-y-1/2">
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-white md:text-[56px]">
          {HERO_DATA.title}
        </h1>
        <p className="text-white italic text-base md:text-lg font-light">
          {HERO_DATA.subtitle}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap md:gap-4">
          {HERO_DATA.ctas.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className="bg-[#253E38] px-4 py-3 text-center text-xs font-bold tracking-widest text-white transition-colors hover:bg-[#1a2e28] sm:px-6 sm:text-sm"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
