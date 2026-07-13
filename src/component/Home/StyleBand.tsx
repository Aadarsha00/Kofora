import { STYLE_CATEGORIES } from "@/data/HomeData";
import { pickImage, SiteImageMap } from "@/lib/siteImages";
import Image from "next/image";
import Link from "next/link";

export default function StyleBand({ images }: { images?: SiteImageMap }) {
  return (
    <section className="flex w-full flex-col gap-6 px-3 py-12 md:gap-8 md:px-14 md:py-16">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm font-normal tracking-wide text-gray-500">
          Find your fit
        </p>
        <h2 className="text-2xl font-black uppercase tracking-widest text-black md:text-4xl">
          Shop by Style
        </h2>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
        {STYLE_CATEGORIES.map((style) => (
          <Link
            key={style.label}
            href={style.href}
            className="group relative aspect-square overflow-hidden rounded-lg bg-[#f4f1ec]"
          >
            <Image
              src={pickImage(images, style.imageKey, style.image)}
              alt={style.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/20" />
            <span className="absolute inset-0 flex items-center justify-center text-center text-sm font-bold uppercase tracking-widest text-white underline-offset-4 group-hover:underline md:text-base">
              {style.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
