import { HERO_DATA } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"


export default function Hero({ images }: { images?: SiteImageMap }) {
  return (
    <section className="relative h-[500px] w-full overflow-hidden md:h-[540px]">
      <Image
        src={pickImage(images, HERO_DATA.imageKey, HERO_DATA.image)}
        alt="Parent and child sharing a playful moment in colorful socks"
        fill
        className="object-cover object-[68%_68%] md:object-[center_65%]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/15" />

      <div className="absolute bottom-8 left-5 right-5 flex flex-col gap-4 md:bottom-auto md:left-18 md:right-auto md:top-1/2 md:w-auto md:max-w-175 md:-translate-y-1/2">
        <h1 className="max-w-full text-3xl font-black uppercase leading-[0.98] text-white sm:text-4xl md:max-w-150 md:text-[54px]">
          {HERO_DATA.titleLines.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </h1>
        <p className="text-base font-medium text-white md:text-lg">
          {HERO_DATA.subtitle}
        </p>
        <div className="mt-2 grid w-[calc(100vw_-_2.5rem)] min-w-0 grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-row sm:flex-wrap md:gap-4">
          {HERO_DATA.ctas.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className="min-w-0 rounded-md bg-[#253E38] px-3 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#1a2e28] sm:px-6 sm:text-sm"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
