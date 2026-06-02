"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ColorMixItem, Product } from "@/interface/Product";
import { needsSwatchBorder, swatchBackground, variantSwatchColors } from "@/lib/colorMix";
import { useProductModal } from "@/store/productModalStore";

type ProductImageLike = {
  id?: number | string;
  image?: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
  is_active?: boolean;
  variant?: number | string | null;
  variant_id?: number | string | null;
};

type ColorOption = {
  label: string;
  color: string;
  swatchColors: ColorMixItem[];
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
    () => (Array.isArray(product.images) ? product.images.filter((image) => image.is_active !== false) : []),
    [product.images]
  );

  const activeVariant = variants[activeVariantIndex] ?? null;

  const imageVariantKey = useCallback((img: ProductImageLike) => img.variant_id ?? img.variant ?? null, []);

  const sortImages = useCallback((items: ProductImageLike[]) => {
    return [...items].sort((a, b) => {
      if (Boolean(a.is_primary) !== Boolean(b.is_primary)) return a.is_primary ? -1 : 1;
      const orderA = a.sort_order ?? 0;
      const orderB = b.sort_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return Number(a.id ?? 0) - Number(b.id ?? 0);
    });
  }, []);

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
          swatchColors: variantSwatchColors(variant),
          variantIndex: index,
        });
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const generalImages = useMemo(() => {
    return sortImages(images.filter((img) => imageVariantKey(img) === null));
  }, [images, imageVariantKey, sortImages]);

  const variantImages = useMemo(() => {
    if (!activeVariant?.id) return [];
    const activeColor = String(activeVariant.color ?? "").trim();
    const colorVariantIds = new Set(
      variants
        .filter((variant) => String(variant.color ?? "").trim() === activeColor)
        .map((variant) => String(variant.id))
    );

    return sortImages(
      images.filter((img) => {
        const variantKey = imageVariantKey(img);
        return variantKey != null && colorVariantIds.has(String(variantKey));
      })
    );
  }, [images, activeVariant, variants, imageVariantKey, sortImages]);

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

    if (images.length > 0) return sortImages(images);

    return [];
  }, [variantImages, variantOverrideImage, generalImages, images, sortImages]);

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
      className={`flex min-w-0 flex-col gap-2 rounded-2xl transition-all duration-300 md:gap-2.5 ${
        hovered
          ? "md:bg-white md:shadow-[0_4px_24px_rgba(0,0,0,0.10)] md:p-3 md:-m-3"
          : "bg-transparent p-0 m-0"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className="relative block w-full overflow-hidden rounded-lg bg-[#EFEFEF] md:rounded-xl"
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

      {colorOptions.length > 0 && (
        <div className="flex items-center gap-2 px-0.5">
          {colorOptions.map((c) => (
            <button
              key={`${c.color}-${c.variantIndex}`}
              type="button"
              title={c.label}
              onClick={() => handleVariantChange(c.variantIndex)}
              style={{
                background: swatchBackground(c.swatchColors),
                border: needsSwatchBorder(c.swatchColors) ? "1px solid #c7c7c7" : "1px solid #d1d5db",
              }}
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
        <p className="font-semibold text-[13px] leading-snug text-black md:text-[14px]">
          {product.name}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-bold text-black md:text-[14px]">
            {product.base_currency} {price.toLocaleString()}
          </span>

          {compareAtPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {product.base_currency} {compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.short_description && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-400 md:text-xs">
            {product.short_description}
          </p>
        )}
      </Link>

      <div
        className={`flex translate-y-0 gap-2 px-0.5 opacity-100 transition-all duration-300 ${
          hovered ? "md:translate-y-0 md:opacity-100" : "md:translate-y-1 md:opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => open(product.id, gender, product.slug)}
          className="w-full rounded-md border border-black py-2 text-xs font-semibold tracking-wide text-black transition-colors duration-200 hover:bg-black hover:text-white md:py-2 md:text-sm"
        >
          Quick View
        </button>
      </div>
    </div>
  );
}
