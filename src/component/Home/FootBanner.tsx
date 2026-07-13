import { FOOT_BANNER_DATA } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"


export default function FootBanner({ images }: { images?: SiteImageMap }) {
  return (
    <section className="relative w-full h-100 md:h-175 overflow-hidden">
      <Image
        src={pickImage(images, FOOT_BANNER_DATA.imageKey, FOOT_BANNER_DATA.image)}
        alt={FOOT_BANNER_DATA.title}
        fill
        className="object-cover object-center"
      />
      <div className="absolute bottom-0 left-0 w-full md:w-125 h-50 bg-linear-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-10 md:bottom-40 left-6 text-white max-w-[90%] md:max-w-lg">
        <h2 className="text-2xl md:text-4xl font-extrabold uppercase mb-3 md:mb-5">
          {FOOT_BANNER_DATA.title}
        </h2>
        <p className="text-base md:text-xl font-normal leading-snug">
          {FOOT_BANNER_DATA.subtitle}
        </p>
      </div>
    </section>
  )
}