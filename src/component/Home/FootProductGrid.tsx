import { FOOT_PRODUCT_GRID } from "@/data/HomeData"
import { pickImage, SiteImageMap } from "@/lib/siteImages"
import Image from "next/image"
import Link from "next/link"

// Hand-drawn rule under the heading: alternating half-cycles 22.153 wide with
// both bezier handles on the segment midpoint, which is what gives it the loose
// wobble rather than a mechanical sine.
const SQUIGGLE_PATH =
  "M0 4.636C11.076 4.636 11.076 16.441 22.153 16.441C33.230 16.441 33.230 4.636 44.306 4.636C55.382 4.636 55.382 16.441 66.459 16.441C77.535 16.441 77.535 4.636 88.612 4.636C99.688 4.636 99.688 16.441 110.765 16.441C121.841 16.441 121.841 4.636 132.918 4.636C143.994 4.636 143.994 16.441 155.071 16.441C166.147 16.441 166.147 4.636 177.224 4.636C188.300 4.636 188.300 16.441 199.377 16.441C210.453 16.441 210.453 4.636 221.530 4.636C232.606 4.636 232.606 16.441 243.683 16.441C254.759 16.441 254.759 4.636 265.836 4.636"

export default function FootProductGrid({ images }: { images?: SiteImageMap }) {
  return (
    <section className="w-full bg-white pt-12 pb-14 md:pt-14 md:pb-16 lg:pt-16 lg:pb-18">
      <div className="mx-auto w-full max-w-[1424px] px-6 md:px-12">
        <div className="flex flex-col items-center">
          {/* Inner block shrinks to the heading so the squiggle tracks its width. */}
          <div className="flex max-w-full flex-col items-center">
            <h2 className="text-center text-2xl font-black uppercase leading-none text-black md:text-4xl">
              Comfort, Your Way
            </h2>
            <svg
              viewBox="0 0 269.662 18.295"
              fill="none"
              aria-hidden="true"
              className="mt-3 w-full"
            >
              <path
                d={SQUIGGLE_PATH}
                stroke="#FF4E11"
                strokeWidth="2.89"
                strokeLinecap="round"
                strokeMiterlimit="10"
              />
            </svg>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3 md:gap-8">
          {FOOT_PRODUCT_GRID.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative aspect-square overflow-hidden rounded-[20px] bg-[#efefed]"
            >
              <Image
                src={pickImage(images, cat.imageKey, cat.image)}
                alt={cat.title}
                fill
                sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1519px) calc((100vw - 6rem) / 3), 453px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white">
                <h3 className="text-xl font-black uppercase group-hover:underline md:text-2xl lg:text-3xl">
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
