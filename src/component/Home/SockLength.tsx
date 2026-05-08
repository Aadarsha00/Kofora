"use client"
import { SOCK_CATEGORIES, SOCK_LENGTHS } from "@/data/HomeData"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
export default function SockLengthGuide() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <section className="w-full grid grid-cols-3 md:flex md:flex-row">
      {SOCK_LENGTHS.map((sock) => (
        <div key={sock.label} className="flex-1 relative aspect-3/4">

          {/* Front — image */}
          <div
            className={`absolute inset-0 cursor-pointer group overflow-hidden transition-opacity duration-300 ${
              selected === sock.slug ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            onClick={() => setSelected(sock.slug)}
          >
            <Image
              src={sock.image}
              alt={sock.label}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-xs md:text-sm tracking-[0.2em] uppercase border-b border-transparent group-hover:border-white transition-all duration-300">
                {sock.label}
              </span>
            </div>
          </div>

          {/* Back — category links */}
          <div
            className={`absolute inset-0 bg-white flex flex-col transition-opacity duration-300 ${
              selected === sock.slug ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-black text-lg leading-none hover:opacity-50 cursor-pointer"
            >
              ✕
            </button>
            <p className="px-4 md:px-6 pt-16 md:pt-20 pb-4 font-semibold text-xs md:text-sm tracking-widest uppercase text-black">
              {sock.label}
            </p>
            <div className="flex flex-col flex-1 px-4 md:px-6">
              {SOCK_CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.label}
                  href={cat.href(sock.slug)}
                  className={`flex items-center justify-between py-3 md:py-4 text-xs md:text-sm font-medium text-black hover:opacity-50 transition-opacity ${
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
    </section>
  )
}