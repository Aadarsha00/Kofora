"use client";

import { FormEvent, useState } from "react";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import {
  useDeleteProductImage,
  useReorderProductImages,
  useUploadProductImage,
} from "@/hooks/useAdminProducts";
import { AdminImageUploadInput } from "@/interface/admin";
import { ProductImage, ProductVariant } from "@/interface/Product";
import { getApiErrorMessage } from "@/lib/apiError";

interface DisplayGroup {
  key: string;
  label: string;
  color: string | null;
  images: ProductImage[];
}

export default function ImageManager({
  productId,
  images,
  variants,
}: {
  productId: number;
  images: ProductImage[];
  variants: ProductVariant[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  const uploadImage = useUploadProductImage(productId);
  const deleteImage = useDeleteProductImage(productId);
  const reorderImages = useReorderProductImages(productId);

  // ── Colour model ────────────────────────────────────────────
  const colorByVariantId = new Map(variants.map((variant) => [variant.id, variant.color]));
  const colorOrder: string[] = [];
  for (const variant of variants) {
    const value = variant.color?.trim();
    if (value && !colorOrder.includes(value)) colorOrder.push(value);
  }
  // The storefront uses the first (active) variant of a colour as that colour's image source.
  const representativeVariantId = (target: string): number | undefined =>
    (variants.find((variant) => variant.color === target && variant.is_active) ??
      variants.find((variant) => variant.color === target))?.id;

  const imageColor = (image: ProductImage): string | null => {
    if (image.variant_id == null) return null;
    return colorByVariantId.get(image.variant_id) ?? null;
  };

  const generalImages = images.filter((image) => imageColor(image) === null);
  const colorGroups: DisplayGroup[] = colorOrder
    .map((value) => ({
      key: value,
      label: value,
      color: value,
      images: images.filter((image) => imageColor(image) === value),
    }))
    .filter((group) => group.images.length > 0);

  const displayGroups: DisplayGroup[] = [
    { key: "__general__", label: "General (whole product)", color: null, images: generalImages },
    ...colorGroups,
  ];
  const mainImageId = generalImages.find((image) => image.is_active)?.id ?? null;

  const reindex = (groups: DisplayGroup[]) =>
    reorderImages.mutate(groups.flatMap((group) => group.images.map((image) => image.id)));

  const move = (groupIndex: number, localIndex: number, direction: -1 | 1) => {
    const target = localIndex + direction;
    const group = displayGroups[groupIndex];
    if (target < 0 || target >= group.images.length) return;
    const nextImages = [...group.images];
    [nextImages[localIndex], nextImages[target]] = [nextImages[target], nextImages[localIndex]];
    reindex(displayGroups.map((current, i) => (i === groupIndex ? { ...current, images: nextImages } : current)));
  };

  const setAsMain = (localIndex: number) => {
    if (localIndex === 0) return;
    const general = displayGroups[0];
    const nextImages = [general.images[localIndex], ...general.images.filter((_, i) => i !== localIndex)];
    reindex(displayGroups.map((current, i) => (i === 0 ? { ...current, images: nextImages } : current)));
  };

  const resetForm = () => {
    setFile(null);
    setFileKey((key) => key + 1);
    setUrl("");
    setAltText("");
    setColor("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!file && !url.trim()) {
      setError("Choose a file or paste an image URL.");
      return;
    }

    const payload: AdminImageUploadInput = {
      product: productId,
      alt_text: altText.trim() || undefined,
      is_active: true,
      sort_order: images.length,
      variant_id: color ? representativeVariantId(color) ?? null : null,
    };
    if (file) payload.image = file;
    else payload.image_url = url.trim();

    uploadImage.mutate(payload, {
      onSuccess: () => resetForm(),
      onError: (err) => setError(getApiErrorMessage(err, "Failed to upload image.")),
    });
  };

  const handleDelete = (image: ProductImage) => {
    if (!window.confirm("Delete this image?")) return;
    deleteImage.mutate(image.id);
  };

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-black">Images</h2>
      <p className="mb-4 text-xs text-gray-500">
        General images show by default. Images assigned to a colour appear when a shopper selects that colour. The first
        General image is the main one.
      </p>

      {images.length === 0 ? (
        <p className="mb-5 border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">No images yet.</p>
      ) : (
        <div className="mb-6 space-y-5">
          {displayGroups
            .filter((group) => group.images.length > 0)
            .map((group) => {
              const groupIndex = displayGroups.indexOf(group);
              const isGeneral = group.color === null;
              return (
                <div key={group.key}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                    {group.label} · {group.images.length}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {group.images.map((image, localIndex) => {
                      const isMain = image.id === mainImageId;
                      return (
                        <div
                          key={image.id}
                          className="group relative aspect-square overflow-hidden border border-gray-200 bg-gray-50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.image} alt={image.alt_text || "Product image"} className="h-full w-full object-cover" />

                          <div className="absolute left-1 top-1 flex flex-col gap-1">
                            {isMain && <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>}
                            {!image.is_active && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Inactive</span>
                            )}
                          </div>

                          <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => move(groupIndex, localIndex, -1)}
                                disabled={localIndex === 0 || reorderImages.isPending}
                                title="Move earlier"
                                className="bg-white/90 p-1 text-gray-700 disabled:opacity-40"
                              >
                                <ArrowUp size={13} className="-rotate-90" />
                              </button>
                              <button
                                type="button"
                                onClick={() => move(groupIndex, localIndex, 1)}
                                disabled={localIndex === group.images.length - 1 || reorderImages.isPending}
                                title="Move later"
                                className="bg-white/90 p-1 text-gray-700 disabled:opacity-40"
                              >
                                <ArrowDown size={13} className="-rotate-90" />
                              </button>
                              {isGeneral && image.is_active && !isMain && (
                                <button
                                  type="button"
                                  onClick={() => setAsMain(localIndex)}
                                  disabled={reorderImages.isPending}
                                  title="Set as main image"
                                  className="bg-white/90 p-1 text-gray-700 disabled:opacity-40"
                                >
                                  <Star size={13} />
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(image)}
                              title="Delete"
                              className="bg-white/90 p-1 text-red-700"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-5">
        <h3 className="mb-3 text-sm font-bold text-black">Add image</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">Upload file</span>
            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="text-sm text-gray-700 file:mr-3 file:border file:border-gray-300 file:bg-gray-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">…or image URL</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              disabled={Boolean(file)}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black disabled:bg-gray-100"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">Alt text</span>
            <input
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">Show for colour</span>
            <select
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            >
              <option value="">General (all colours)</option>
              {colorOrder.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={uploadImage.isPending}
            className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Upload size={15} />
            {uploadImage.isPending ? "Uploading..." : "Upload image"}
          </button>
          {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
        </div>
      </form>
    </section>
  );
}
