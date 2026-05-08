"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/interface/Product";
import { useProductModal } from "@/store/productModalStore";

type ProductImageLike = {
  id?: number | string;
  image?: string;
  alt_text?: string;
  variant?: number | string | null;
  variant_id?: number | string | null;
};

type ColorOption = {
  label: string;
  color: string;
  variantIndex: number;
};

export default function ProductCard({
  product,
  gender,
}: {
  product: Product;
  gender: string;
}) {
  const { open } = useProductModal();

  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const variants = useMemo(
    () => {
      const allVariants = Array.isArray(product.variants) ? product.variants : [];
      const purchasableVariants = allVariants.filter(
        (variant) => variant.is_active && variant.available_quantity > 0
      );

      return purchasableVariants.length > 0 ? purchasableVariants : allVariants;
    },
    [product.variants]
  );
  const images: ProductImageLike[] = useMemo(
    () => (Array.isArray(product.images) ? product.images : []),
    [product.images]
  );

  const activeVariant = variants[activeVariantIndex] ?? null;

  const normalizeColor = useCallback((color?: string) => {
    if (!color) return "#000000";

    let value = color.trim();

    if (!value.startsWith("#")) {
      value = `#${value}`;
    }

    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
      ? value
      : "#000000";
  }, []);

  const isSameVariant = useCallback(
    (img: ProductImageLike, variantId: number | string) => {
      return (
        String(img.variant_id ?? "") === String(variantId) ||
        String(img.variant ?? "") === String(variantId)
      );
    },
    []
  );

  const colorOptions: ColorOption[] = useMemo(() => {
    const map = new Map<string, ColorOption>();

    variants.forEach((variant, index) => {
      const rawColor = String(variant.color ?? "").trim();
      const normalizedKey = rawColor.toLowerCase();

      if (!rawColor) return;

      if (!map.has(normalizedKey)) {
        map.set(normalizedKey, {
          label: rawColor,
          color: rawColor,
          variantIndex: index,
        });
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const generalImages = useMemo(() => {
    return images.filter(
      (img) =>
        img.variant === null ||
        img.variant === undefined ||
        img.variant_id === null ||
        img.variant_id === undefined
    );
  }, [images]);

  const variantImages = useMemo(() => {
    if (!activeVariant?.id) return [];

    return images.filter((img) => isSameVariant(img, activeVariant.id));
  }, [images, activeVariant, isSameVariant]);

  const variantOverrideImage = useMemo(() => {
    if (!activeVariant?.image_override) return null;

    return {
      id: `override-${activeVariant.id}`,
      image: activeVariant.image_override,
      alt_text: activeVariant.title || product.name,
      variant: activeVariant.id,
    };
  }, [activeVariant, product.name]);

  const finalDisplayImages = useMemo(() => {
    if (variantImages.length > 0) return variantImages;

    if (variantOverrideImage) return [variantOverrideImage];

    if (generalImages.length > 0) return generalImages;

    if (images.length > 0) return images;

    return [];
  }, [variantImages, variantOverrideImage, generalImages, images]);

  const handleVariantChange = useCallback((variantIndex: number) => {
    setActiveVariantIndex(variantIndex);
    setImageIndex(0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setImageIndex(0);
  }, []);

  const displayIndex =
    hovered && finalDisplayImages.length > 1
      ? (imageIndex + 1) % finalDisplayImages.length
      : imageIndex;

  const currentImage = finalDisplayImages[displayIndex]?.image ?? null;

  const price = activeVariant?.price ? parseFloat(activeVariant.price) : 0;
  const compareAtPrice = activeVariant?.compare_at_price
    ? parseFloat(activeVariant.compare_at_price)
    : 0;

  const href = `/collections/${gender}/${product.slug}?id=${product.id}`;

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-2xl transition-all duration-300 ${
        hovered
          ? "bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-3 -m-3"
          : "bg-transparent p-0 m-0"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className="relative w-full rounded-xl overflow-hidden block bg-[#EFEFEF]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {currentImage ? (
          <Image
            src={currentImage}
            alt={finalDisplayImages[displayIndex]?.alt_text || product.name}
            fill
            loading="eager"
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#E8E6E1]" />
        )}

        {finalDisplayImages.length > 1 && (
          <div
            className={`absolute inset-x-0 bottom-3 flex items-center justify-between px-3 transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              type="button"
              className="text-white drop-shadow text-lg font-light leading-none"
              onClick={(e) => {
                e.preventDefault();
                setImageIndex((i) =>
                  i === 0 ? finalDisplayImages.length - 1 : i - 1
                );
              }}
            >
              ←
            </button>

            <div className="flex items-center gap-1.5">
              {finalDisplayImages.map((img, i) => (
                <button
                  key={String(img.id ?? i)}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setImageIndex(i);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    displayIndex === i
                      ? "w-6 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              className="text-white drop-shadow text-lg font-light leading-none"
              onClick={(e) => {
                e.preventDefault();
                setImageIndex((i) =>
                  i === finalDisplayImages.length - 1 ? 0 : i + 1
                );
              }}
            >
              →
            </button>
          </div>
        )}
      </Link>

      {colorOptions.length > 1 && (
        <div className="flex items-center gap-2 px-0.5">
          {colorOptions.map((c) => (
            <button
              key={`${c.color}-${c.variantIndex}`}
              type="button"
              title={c.label}
              onClick={() => handleVariantChange(c.variantIndex)}
              style={{ backgroundColor: normalizeColor(c.color) }}
              className={`w-5 h-5 rounded-full border border-gray-300 transition-all duration-200 ${
                c.variantIndex === activeVariantIndex
                  ? "ring-2 ring-offset-2 ring-black scale-110"
                  : "hover:scale-110"
              }`}
            />
          ))}
        </div>
      )}

      <Link href={href} className="flex flex-col gap-0.5 px-0.5">
        <p className="font-semibold text-[14px] text-black leading-snug">
          {product.name}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-bold text-black">
            {product.base_currency} {price.toLocaleString()}
          </span>

          {compareAtPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {product.base_currency} {compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.short_description && (
          <p className="text-xs text-gray-400 mt-0.5">
            {product.short_description}
          </p>
        )}
      </Link>

      <div
        className={`px-0.5 flex gap-2 transition-all duration-300 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        <button
          type="button"
          onClick={() => open(product.id, gender, product.slug)}
          className="w-full border border-black rounded-md py-2 text-sm font-semibold tracking-wide text-black hover:bg-black hover:text-white transition-colors duration-200"
        >
          Quick View
        </button>
      </div>
    </div>
  );
}
