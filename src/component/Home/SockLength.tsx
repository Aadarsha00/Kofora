"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const SOCK_LENGTHS = [
  { label: "No Show",   image: "/socks1.webp", slug: "no-show"   },
  { label: "Ankle",     image: "/socks2.webp", slug: "ankle"     },
  { label: "Quarter",   image: "/socks3.webp", slug: "quarter"   },
  { label: "Half Calf", image: "/socks5.webp", slug: "half-calf" },
  { label: "Calf",      image: "/socks5.webp", slug: "calf"      },
  { label: "Knee High", image: "/socks6.webp", slug: "knee-high" },
];

const CATEGORIES = [
  { label: "Women", href: (slug: string) => `/collections/women?height=${slug}` },
  { label: "Men",   href: (slug: string) => `/collections/men?height=${slug}`   },
  { label: "All",   href: (slug: string) => `/collections/all?height=${slug}`   },
];

export default function SockLengthGuide() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="w-full flex flex-row">
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
              <span className="text-white font-['Inter'] font-semibold text-sm tracking-[0.2em] uppercase border-b border-transparent group-hover:border-white transition-all duration-300">
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
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-black text-lg leading-none hover:opacity-50 cursor-pointer"
            >
              ✕
            </button>

            {/* Label */}
            <p className="px-6 pt-20 pb-4 font-semibold text-sm tracking-widest uppercase text-black">
              {sock.label}
            </p>

            {/* Links */}
            <div className="flex flex-col flex-1 px-6">
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.label}
                  href={cat.href(sock.slug)}
                  className={`flex items-center justify-between py-4 text-sm font-medium text-black hover:opacity-50 transition-opacity ${
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
  );
}