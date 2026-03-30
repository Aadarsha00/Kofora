"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/interface/Product";

export default function ProductCard({ product }: { product: Product }) {
  const [activeColor, setActiveColor] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const variant = product.colors[activeColor];
  const images = variant.images;

  const handleColorChange = (i: number) => {
    setActiveColor(i);
    setImageIndex(0);
  };

  return (
    <div
      className={`flex flex-col gap-3 cursor-pointer rounded-2xl transition-all duration-300 ${
        hovered
          ? "bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-3 -m-3"
          : "bg-transparent p-0 m-0"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setImageIndex(0); }}
    >
      {/* ── Card Container ──────────────────────────────────────────── */}
      <div className="relative w-full aspect-3/4 bg-[#EFEFEF] rounded-2xl overflow-hidden">

        {/* Primary image */}
        <div className="absolute inset-0">
          {images[imageIndex] ? (
            <Image
              src={images[imageIndex]}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-500"
            />
          ) : (
            <div className="w-full h-full bg-[#E8E6E1]" />
          )}
        </div>

        {/* Secondary image — fades in on hover */}
        {images[1] && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <Image src={images[1]} alt={`${product.name} hover`} fill className="object-cover" />
          </div>
        )}

        {/* Image nav — arrows + pill dots, visible on hover */}
        {images.length > 1 && (
          <div className={`absolute bottom-3 left-0 right-0 flex items-center justify-between px-4 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <button
              className="text-gray-600 hover:text-black text-lg font-light"
              onClick={(e) => { e.preventDefault(); setImageIndex((i) => Math.max(0, i - 1)); }}
            >
              ←
            </button>
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImageIndex(i); }}
                  className={`rounded-full transition-all duration-300 ${imageIndex === i ? "w-8 h-1.5 bg-black" : "w-1.5 h-1.5 bg-gray-400"}`}
                />
              ))}
            </div>
            <button
              className="text-gray-600 hover:text-black text-lg font-light"
              onClick={(e) => { e.preventDefault(); setImageIndex((i) => Math.min(images.length - 1, i + 1)); }}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* ── Color Swatches ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {product.colors.map((c, i) => (
          <button
            key={i}
            title={c.label}
            onClick={() => handleColorChange(i)}
            className={`w-6 h-6 rounded-full transition-all duration-200 ${
              i === activeColor ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-110"
            }`}
            style={{
              backgroundColor: c.color,
              border: c.color === "#FFFFFF" || c.color === "#E8E4DC" ? "1px solid #ccc" : "none",
            }}
          />
        ))}
      </div>

      {/* ── Product Info ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-[15px] text-black leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-bold text-black">NPR {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">NPR {product.originalPrice.toLocaleString()}</span>
          )}
          {product.packSavings && (
            <span className="text-xs text-[#253E38] font-semibold">{product.packSavings}</span>
          )}
        </div>
        {(product.category || product.weight) && (
          <p className="text-xs text-gray-400">{product.category} · {product.weight}</p>
        )}
      </div>

      {/* ── Quick View — below card, fades in on hover ──────────────── */}
      <div className={`transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
        <button className="w-full border border-black rounded-md py-2.5 text-sm font-bold tracking-wide text-black hover:bg-black hover:text-white transition-colors duration-200">
          Quick View +
        </button>
      </div>
    </div>
  );
}