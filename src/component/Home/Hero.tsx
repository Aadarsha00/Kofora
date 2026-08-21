import { HERO_DATA } from "@/data/HomeData"
import { pickImage, pickVideo, SiteImageMap, SiteVideoMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"

export default function Hero({
  images,
  videos,
}: {
  images?: SiteImageMap
  videos?: SiteVideoMap
}) {
  const poster = pickImage(images, HERO_DATA.imageKey, HERO_DATA.image)
  const video = pickVideo(videos, HERO_DATA.imageKey)

  return (
    // Full-bleed photo across the whole viewport width with the copy centred on
    // top of it. Height is viewport-driven rather than an aspect ratio so the
    // image never letterboxes on wide screens.
    <section className="relative w-full">
      <div className="relative h-[78vh] max-h-[760px] min-h-[460px] w-full overflow-hidden md:h-[72vh]">
        {/* An uploaded video wins over the photo; the photo stays as the
            poster so the slot still looks right while the clip loads and on
            devices that refuse to autoplay. Muted + playsInline is what makes
            autoplay legal on iOS and Chrome. */}
        {video ? (
          <video
            src={video}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[68%_60%] md:object-[center_58%]"
          />
        ) : (
          <Image
            src={poster}
            alt="Parent and child sharing a playful moment in colorful socks"
            fill
            sizes="100vw"
            className="object-cover object-[68%_60%] md:object-[center_58%]"
            priority
          />
        )}

        {/* Scrim: heavier at the bottom where the buttons sit, so white type
            stays legible over any photo an admin swaps in. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/30 md:bg-gradient-to-b md:from-black/25 md:via-black/30 md:to-black/45"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-4 font-black uppercase leading-[0.85] tracking-normal text-white text-[clamp(34px,10vw,68px)] md:mb-5 md:text-[clamp(48px,6.4vw,104px)]">
            {HERO_DATA.titleLines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </h1>
          <p className="mb-8 max-w-xl font-normal leading-[1.25] text-white text-[clamp(16px,4vw,20px)] md:mb-9 md:text-[clamp(18px,1.6vw,24px)]">
            {HERO_DATA.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {HERO_DATA.ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-white px-8 text-sm font-extrabold leading-[1.15em] text-[#1a1a1a] transition-[border-radius,background-color,box-shadow,color] duration-300 ease-[cubic-bezier(0,0.5,0.5,1)] hover:rounded-[calc(0.375rem+6px)] hover:bg-white/90"
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
