"use client"
import { SOCK_CATEGORIES, SOCK_LENGTHS } from "@/data/HomeData"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function SockLengthGuide() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <section className="flex w-full flex-col gap-6 px-3 py-12 md:gap-8 md:px-14 md:py-16">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm font-normal tracking-wide text-gray-500">
          Pick your length
        </p>
        <h2 className="text-2xl font-black uppercase tracking-widest text-black md:text-4xl">
          Shop by Height
        </h2>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {SOCK_LENGTHS.map((sock) => (
          <div
            key={sock.label}
            className="relative aspect-[7/8] overflow-hidden rounded-lg"
          >
            {/* Front — image */}
            <div
              className={`group absolute inset-0 cursor-pointer overflow-hidden transition-opacity duration-300 ${
                selected === sock.slug ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
              onClick={() => setSelected(sock.slug)}
            >
              <Image
                src={sock.image}
                alt={sock.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
                <span className="border-b border-transparent text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all duration-300 group-hover:border-white md:text-sm">
                  {sock.label}
                </span>
              </div>
            </div>

            {/* Back — category links */}
            <div
              className={`absolute inset-0 flex flex-col justify-center bg-white px-3 transition-opacity duration-300 ${
                selected === sock.slug ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-2 top-2 text-base leading-none text-black hover:opacity-50"
              >
                ✕
              </button>
              <p className="pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-black md:text-xs">
                {sock.label}
              </p>
              <div className="flex flex-col">
                {SOCK_CATEGORIES.map((cat, i) => (
                  <Link
                    key={cat.label}
                    href={cat.href(sock.slug)}
                    className={`flex items-center justify-between py-2 text-[11px] font-medium text-black transition-opacity hover:opacity-50 md:text-xs ${
                      i !== 0 ? "border-t border-gray-200" : ""
                    }`}
                  >
                    {cat.label}
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
