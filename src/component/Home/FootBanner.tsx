import { FOOT_BANNER_DATA } from "@/data/HomeData"
import Link from "next/link"

// Cream band with mirrored wavy edges, drawn two panels wide (4128 = 6 whole
// cycles) so the -50% slide in `kofora-wave-flow` loops without a seam. The
// bottom edge is the top mirrored through H, which is what makes the band
// pinch and bulge instead of just undulating.
const BLOB_PATH =
  "M0 100C172 100 172 300 344 300C516 300 516 100 688 100C860 100 860 300 1032 300C1204 300 1204 100 1376 100C1548 100 1548 300 1720 300C1892 300 1892 100 2064 100C2236 100 2236 300 2408 300C2580 300 2580 100 2752 100C2924 100 2924 300 3096 300C3268 300 3268 100 3440 100C3612 100 3612 300 3784 300C3956 300 3956 100 4128 100L4128 900C3956 900 3956 700 3784 700C3612 700 3612 900 3440 900C3268 900 3268 700 3096 700C2924 700 2924 900 2752 900C2580 900 2580 700 2408 700C2236 700 2236 900 2064 900C1892 900 1892 700 1720 700C1548 700 1548 900 1376 900C1204 900 1204 700 1032 700C860 700 860 900 688 900C516 900 516 700 344 700C172 700 172 900 0 900Z"

export default function FootBanner() {
  return (
    <section className="w-full bg-[#253E38] py-12 md:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1424px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
          <div className="relative aspect-[3/2] w-full overflow-hidden md:col-span-2 md:aspect-[2064/1000]">
            <svg
              viewBox="0 0 4128 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="kofora-wave absolute inset-y-0 left-0 h-full w-[200%]"
              style={{ animation: "kofora-wave-flow 24s linear infinite" }}
            >
              <path d={BLOB_PATH} fill="#fdfcf6" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center px-8 pb-9 pt-8 text-center">
              <h2 className="font-black uppercase leading-[0.8] tracking-normal text-[#1a2e28] text-[clamp(22px,9vw,54px)] md:text-[clamp(30px,4.6vw,64px)] lg:text-[clamp(38px,5.5vw,87px)]">
                {FOOT_BANNER_DATA.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <p className="font-(family-name:--font-accent) text-[#fdfcf6] leading-snug text-lg md:text-xl">
              {FOOT_BANNER_DATA.subtitle}
            </p>
            <Link
              href={FOOT_BANNER_DATA.cta.href}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#fdfcf6] px-6 text-sm font-bold uppercase tracking-wider text-[#1a2e28] transition-colors hover:bg-white"
            >
              {FOOT_BANNER_DATA.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
