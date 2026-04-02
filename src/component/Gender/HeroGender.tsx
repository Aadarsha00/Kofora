"use client";

import { getProductsByGender, SockHeight } from "@/data/ProductsData";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";


const HEIGHT_META: Record<SockHeight, { label: string; description: string }> = {
  "No-Show":   { label: "No Show Socks",   description: "Designed to stay in place and out of sight." },
  "Ankle":     { label: "Ankle Socks",     description: "A small pop of sock with a cushy anti-blister tab." },
  "Quarter":   { label: "Quarter Socks",   description: "The high-tops of socks, with stay-put cuffs." },
  "Crew":      { label: "Crew Socks",      description: "A classic height that pairs with everything." },
  "Half-Calf": { label: "Half Calf Socks", description: "A sporty height you can wear slouchy or straight." },
  "Knee-High": { label: "Knee High Socks", description: "A perfect, no-slouch fit from knees to toes." },
    "Calf":      { label: "Calf Socks",      description: "Classic height with a modern fit and feel." },
};

const HEIGHT_ORDER: SockHeight[] = [
  "Ankle",
  "Half-Calf",
  "Quarter",
  "Crew",
  "Knee-High",
  "No-Show",
    "Calf",
];

const VISIBLE_COUNT = 5;

interface HeightHeroProps {
  gender: "women" | "men";
}

export default function HeroGender({ gender }: HeightHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeHeight = searchParams.get("height") as SockHeight | null;
  const [startIndex, setStartIndex] = useState(0);

  const products = getProductsByGender(gender);

  // Build height -> first image from data
  const heightImageMap: Partial<Record<SockHeight, string>> = {};
  for (const product of products) {
    if (product.height && !heightImageMap[product.height]) {
      const firstImage = product.colors[0]?.images[0];
      if (firstImage) heightImageMap[product.height] = firstImage;
    }
  }

  const availableHeights = HEIGHT_ORDER.filter((h) =>
    products.some((p) => p.height === h)
  );

  const isCarousel = availableHeights.length > VISIBLE_COUNT;

  // Slice the visible window
  const visibleHeights = isCarousel
    ? availableHeights.slice(startIndex, startIndex + VISIBLE_COUNT)
    : availableHeights;

  const canGoLeft = startIndex > 0;
  const canGoRight = startIndex + VISIBLE_COUNT < availableHeights.length;

  const handleClick = (height: SockHeight) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeHeight === height) {
      params.delete("height");
    } else {
      params.set("height", height);
    }
    router.push(`/product/${gender}?${params.toString()}`);
  };

  return (
    <section className="bg-[#eeeee8] px-6 pt-5 pb-6 sm:px-10">
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-xl font-bold text-[#1a1a1a]">
          {gender === "women" ? "All Women" : "All Men"}
        </h1>

        {isCarousel && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
              disabled={!canGoLeft}
              className="w-8 h-8 rounded-full border border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a1a1a] hover:text-white transition-colors duration-200"
              aria-label="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => setStartIndex((i) => Math.min(availableHeights.length - VISIBLE_COUNT, i + 1))}
              disabled={!canGoRight}
              className="w-8 h-8 rounded-full border border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a1a1a] hover:text-white transition-colors duration-200"
              aria-label="Next"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tile strip */}
      <div
        className="grid gap-3 w-full"
        style={{
          gridTemplateColumns: `repeat(${visibleHeights.length}, minmax(0, 1fr))`,
        }}
      >
        {visibleHeights.map((height) => {
          const meta = HEIGHT_META[height];
          const image = heightImageMap[height];
          const isActive = activeHeight === height;

          return (
            <button
              key={height}
              onClick={() => handleClick(height)}
              aria-label={`Filter by ${meta.label}`}
              className="group flex flex-col gap-2 text-left focus:outline-none"
            >
              {/* Image */}
              <div
                className={`relative w-full overflow-hidden rounded-sm transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-[#1a1a1a] ring-offset-1 ring-offset-[#eeeee8]"
                    : ""
                }`}
                style={{ aspectRatio: "1 / 1" }}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={meta.label}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[#d0cec8]" />
                )}

                {isActive && (
                  <span className="absolute top-1.5 left-1.5 bg-[#1a1a1a] text-white text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-sm">
                    ✓
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1">
                <p
                  className={`text-base font-bold font-serif text-[#1a1a1a] leading-tight ${
                    isActive
                      ? "underline underline-offset-2"
                      : "group-hover:underline group-hover:underline-offset-2"
                  }`}
                >
                  {meta.label}
                </p>
                <p className="text-sm text-[#666] leading-snug">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}