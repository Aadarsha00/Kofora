import { FOOT_BANNER_DATA } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"


export default function FootBanner({ images }: { images?: SiteImageMap }) {
  return (
    <section className="relative h-[500px] w-full overflow-hidden md:h-[620px]">
      <Image
        src={pickImage(images, FOOT_BANNER_DATA.imageKey, FOOT_BANNER_DATA.image)}
        alt={FOOT_BANNER_DATA.title}
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/10" />
      <div className="absolute bottom-8 left-5 max-w-[calc(100%_-_2.5rem)] text-white md:bottom-16 md:left-14 md:max-w-lg">
        <h2 className="mb-3 text-3xl font-black uppercase leading-none md:mb-4 md:text-5xl">
          {FOOT_BANNER_DATA.title}
        </h2>
        <p className="max-w-md text-base font-medium leading-snug md:text-lg">
          {FOOT_BANNER_DATA.subtitle}
        </p>
        <Link
          href={FOOT_BANNER_DATA.cta.href}
          className="mt-6 inline-block rounded-md bg-[#253E38] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1a2e28]"
        >
          {FOOT_BANNER_DATA.cta.label}
        </Link>
      </div>
    </section>
  )
}
