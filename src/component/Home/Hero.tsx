import { HERO_DATA } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"

const PANEL_SIZES = "(max-width: 767px) 100vw, 50vw"

export default function Hero({ images }: { images?: SiteImageMap }) {
  return (
    <section className="w-full bg-white">
      {/* md and up: the original two panels side by side, photo left, flat colour
          block right. Mobile: a single frame with the copy laid over the photo,
          so the colour panel is transparent and overlaps the image. */}
      <div className="relative grid w-full grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={pickImage(images, HERO_DATA.imageKey, HERO_DATA.image)}
            alt="Parent and child sharing a playful moment in colorful socks"
            fill
            sizes={PANEL_SIZES}
            className="object-cover object-[68%_60%] md:object-[center_60%]"
            priority
          />
          {/* Scrim keeps the overlaid type legible; only needed on mobile. */}
          <div className="absolute inset-0 bg-black/40 md:hidden" aria-hidden="true" />
        </div>

        <div
          className="absolute inset-0 z-10 w-full md:relative md:inset-auto md:z-0 md:aspect-[4/3] md:bg-[var(--hero-panel)]"
          style={{ "--hero-panel": HERO_DATA.panelColor } as CSSProperties}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center md:px-8 md:pb-9 md:pt-8 lg:px-20 lg:py-0">
            <h1 className="mb-2.5 font-black uppercase leading-[0.8] tracking-normal text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.45)] text-[clamp(28px,9.8vw,70px)] md:mb-4 md:text-[clamp(32px,6.5vw,90px)] md:[text-shadow:none] lg:mb-5 lg:text-[clamp(40px,4.7vw,90px)]">
              {HERO_DATA.titleLines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </h1>
            <p className="mb-6 font-normal leading-[1.1] text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.5)] text-[clamp(20px,2vw,24px)] md:text-base md:[text-shadow:none] lg:text-[clamp(18px,1.6vw,27px)]">
              {HERO_DATA.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {HERO_DATA.ctas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-white/95 px-6 text-sm font-extrabold leading-[1.15em] text-[#1a1a1a] transition-[border-radius,background-color,box-shadow,color] duration-300 ease-[cubic-bezier(0,0.5,0.5,1)] hover:rounded-[calc(0.375rem+6px)] hover:bg-white"
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
