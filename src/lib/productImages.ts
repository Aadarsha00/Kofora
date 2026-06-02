import { Product, ProductImage, ProductVariant } from "@/interface/Product";

export function imageVariantId(image: Pick<ProductImage, "variant" | "variant_id">): number | null {
  const raw = image.variant_id ?? image.variant ?? null;
  return raw == null ? null : Number(raw);
}

export function sortProductImages<T extends Pick<ProductImage, "id" | "sort_order" | "is_primary">>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return Number(a.id) - Number(b.id);
  });
}

export function productImages(product: Product): ProductImage[] {
  return sortProductImages(
    product.images.filter((image) => image.is_active && imageVariantId(image) === null)
  );
}

export function variantImages(product: Product, variantId: number): ProductImage[] {
  return sortProductImages(
    product.images.filter((image) => image.is_active && imageVariantId(image) === variantId)
  );
}

export function colorImages(product: Product, color: string): ProductImage[] {
  const colorVariantIds = new Set(
    product.variants
      .filter((variant) => variant.color.trim() === color.trim())
      .map((variant) => variant.id)
  );

  return sortProductImages(
    product.images.filter((image) => {
      const variantId = imageVariantId(image);
      return image.is_active && variantId != null && colorVariantIds.has(variantId);
    })
  );
}

export function fallbackImages(product: Product, variant?: ProductVariant | null): ProductImage[] {
  if (variant) {
    const scoped = colorImages(product, variant.color);
    if (scoped.length > 0) return scoped;
  }

  const general = productImages(product);
  if (general.length > 0) return general;

  return sortProductImages(product.images.filter((image) => image.is_active));
}

export function defaultVariant(product: Product): ProductVariant | null {
  return product.variants.find((variant) => variant.is_active) ?? product.variants[0] ?? null;
}

export function defaultDisplayImages(product: Product): ProductImage[] {
  const variant = defaultVariant(product);
  if (variant) {
    const scoped = colorImages(product, variant.color);
    if (scoped.length > 0) return scoped;
  }

  const general = productImages(product);
  if (general.length > 0) return general;

  return sortProductImages(product.images.filter((image) => image.is_active));
}

export function primaryProductImage(product: Product): ProductImage | null {
  return defaultDisplayImages(product)[0] ?? null;
}
