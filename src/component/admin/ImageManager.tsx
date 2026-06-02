"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import {
  useDeleteProductImage,
  useReorderProductImages,
  useUpdateProductImage,
  useUploadProductImage,
} from "@/hooks/useAdminProducts";
import { AdminImageUploadInput } from "@/interface/admin";
import { ProductImage, ProductVariant } from "@/interface/Product";
import { getApiErrorMessage } from "@/lib/apiError";
import { imageVariantId, sortProductImages } from "@/lib/productImages";

const GENERAL_GROUP = "__general__";

interface UploadFormState {
  file: File | null;
  fileKey: number;
  url: string;
  altText: string;
  makePrimary: boolean;
  groupKey: string;
  groupTouched: boolean;
}

interface ImageGroup {
  key: string;
  title: string;
  subtitle: string;
  color: string | null;
  images: ProductImage[];
}

const emptyUploadState = (groupKey: string): UploadFormState => ({
  file: null,
  fileKey: 0,
  url: "",
  altText: "",
  makePrimary: false,
  groupKey,
  groupTouched: false,
});

function groupImageCount(images: ProductImage[], variantIds: Set<number> | null): number {
  return images.filter((image) => {
    const variantId = imageVariantId(image);
    return variantIds ? variantId != null && variantIds.has(variantId) : variantId === null;
  }).length;
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
  const colorOptions = useMemo(() => {
    const colors: string[] = [];
    for (const variant of variants) {
      const color = variant.color.trim();
      if (color && !colors.includes(color)) colors.push(color);
    }
    return colors;
  }, [variants]);

  const defaultGroupKey = colorOptions[0] ?? GENERAL_GROUP;
  const [form, setForm] = useState<UploadFormState>(() => emptyUploadState(defaultGroupKey));
  const [error, setError] = useState("");

  const uploadImage = useUploadProductImage(productId);
  const updateImage = useUpdateProductImage(productId);
  const deleteImage = useDeleteProductImage(productId);
  const reorderImages = useReorderProductImages(productId);

  const colorToVariantIds = useMemo(() => {
    const map = new Map<string, Set<number>>();
    for (const variant of variants) {
      const color = variant.color.trim();
      if (!color) continue;
      const ids = map.get(color) ?? new Set<number>();
      ids.add(variant.id);
      map.set(color, ids);
    }
    return map;
  }, [variants]);

  const representativeVariantId = (color: string): number | null =>
    variants.find((variant) => variant.color.trim() === color.trim() && variant.is_active)?.id ??
    variants.find((variant) => variant.color.trim() === color.trim())?.id ??
    null;

  const productImages = useMemo(
    () => sortProductImages(images.filter((image) => imageVariantId(image) === null)),
    [images]
  );

  const groups = useMemo<ImageGroup[]>(() => {
    const colorGroups = colorOptions.map((color) => {
      const ids = colorToVariantIds.get(color) ?? new Set<number>();
      return {
        key: color,
        title: `${color} images`,
        subtitle: "Shown for every size under this option.",
        color,
        images: sortProductImages(
          images.filter((image) => {
            const variantId = imageVariantId(image);
            return variantId != null && ids.has(variantId);
          })
        ),
      };
    });

    const generalGroup =
      productImages.length > 0 || colorOptions.length === 0
        ? [
            {
              key: GENERAL_GROUP,
              title: "General / no specific color",
              subtitle: "Optional fallback for images that do not belong to one color.",
              color: null,
              images: productImages,
            },
          ]
        : [];

    return [...colorGroups, ...generalGroup];
  }, [colorOptions, colorToVariantIds, images, productImages]);

  const promotedGroupKey =
    !form.groupTouched && form.groupKey === GENERAL_GROUP && colorOptions.length > 0
      ? defaultGroupKey
      : form.groupKey;
  const selectedGroupKey =
    promotedGroupKey === GENERAL_GROUP || colorOptions.includes(promotedGroupKey)
      ? promotedGroupKey
      : defaultGroupKey;
  const selectedVariantIds =
    selectedGroupKey === GENERAL_GROUP ? null : colorToVariantIds.get(selectedGroupKey) ?? new Set<number>();
  const selectedGroupImageCount = groupImageCount(images, selectedVariantIds);
  const noExistingImages = selectedGroupImageCount === 0;
  const isPrimaryChecked = form.makePrimary || noExistingImages;

  const resetForm = () => {
    setForm((current) => ({
      ...emptyUploadState(
        selectedGroupKey === GENERAL_GROUP || colorOptions.includes(selectedGroupKey)
          ? selectedGroupKey
          : defaultGroupKey
      ),
      groupTouched: true,
      fileKey: current.fileKey + 1,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.file && !form.url.trim()) {
      setError("Choose a file or paste an image URL.");
      return;
    }

    const variantId =
      selectedGroupKey === GENERAL_GROUP ? null : representativeVariantId(selectedGroupKey);
    if (selectedGroupKey !== GENERAL_GROUP && !variantId) {
      setError("Choose a valid variant option for this image.");
      return;
    }

    const payload: AdminImageUploadInput = {
      product: productId,
      alt_text: form.altText.trim() || undefined,
      is_active: true,
      is_primary: form.makePrimary || selectedGroupImageCount === 0,
      sort_order: selectedGroupImageCount,
      variant_id: variantId,
    };
    if (form.file) payload.image = form.file;
    else payload.image_url = form.url.trim();

    uploadImage.mutate(payload, {
      onSuccess: resetForm,
      onError: (err) => setError(getApiErrorMessage(err, "Failed to upload image.")),
    });
  };

  const handleDelete = (image: ProductImage) => {
    if (!window.confirm("Delete this image?")) return;
    deleteImage.mutate(image.id);
  };

  const setAsPrimary = (image: ProductImage) => {
    updateImage.mutate({
      id: image.id,
      payload: {
        is_primary: true,
        is_active: true,
      },
    });
  };

  const move = (group: ImageGroup, localIndex: number, direction: -1 | 1) => {
    const target = localIndex + direction;
    if (target < 0 || target >= group.images.length) return;
    const nextImages = [...group.images];
    [nextImages[localIndex], nextImages[target]] = [nextImages[target], nextImages[localIndex]];
    reorderImages.mutate(nextImages.map((image) => image.id));
  };

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-black">Images</h2>
      <p className="mb-5 text-xs text-gray-500">
        Pick which option these photos belong to. Use General only when the photo is not tied to an option.
      </p>

      <form onSubmit={handleSubmit} className="border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-bold text-black">Add image</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <span className="font-semibold text-gray-600">Photos for</span>
            <select
              value={selectedGroupKey}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  groupKey: event.target.value,
                  groupTouched: true,
                  makePrimary: false,
                }))
              }
              className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            >
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
              <option value={GENERAL_GROUP}>General / no specific color</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">Upload file</span>
            <input
              key={form.fileKey}
              type="file"
              accept="image/*"
              onChange={(event) =>
                setForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
              }
              className="text-sm text-gray-700 file:mr-3 file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">or image URL</span>
            <input
              value={form.url}
              onChange={(event) =>
                setForm((current) => ({ ...current, url: event.target.value }))
              }
              placeholder="https://"
              disabled={Boolean(form.file)}
              className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black disabled:bg-gray-100"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-600">Alt text</span>
            <input
              value={form.altText}
              onChange={(event) =>
                setForm((current) => ({ ...current, altText: event.target.value }))
              }
              className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>

          <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={isPrimaryChecked}
              disabled={noExistingImages}
              onChange={(event) =>
                setForm((current) => ({ ...current, makePrimary: event.target.checked }))
              }
            />
            Main image for this option
          </label>
        </div>

        <button
          type="submit"
          disabled={uploadImage.isPending}
          className="mt-4 inline-flex items-center gap-2 bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <Upload size={15} />
          {uploadImage.isPending ? "Uploading..." : "Upload image"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-7 space-y-7">
        {groups.map((group) => (
          <div key={group.key} className="border-t border-gray-200 pt-5">
            <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
              <div>
                <h3 className="text-sm font-bold text-black">{group.title}</h3>
                <p className="text-xs text-gray-500">{group.subtitle}</p>
              </div>
              <span className="text-xs font-semibold text-gray-400">
                {group.images.length} image{group.images.length === 1 ? "" : "s"}
              </span>
            </div>

            {group.images.length === 0 ? (
              <p className="border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                No images assigned.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {group.images.map((image, localIndex) => {
                  const isPrimary = image.is_primary || (!group.images.some((item) => item.is_primary) && localIndex === 0);
                  return (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden border border-gray-200 bg-gray-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.image} alt={image.alt_text || "Product image"} className="h-full w-full object-cover" />

                      <div className="absolute left-1 top-1 flex flex-col gap-1">
                        {isPrimary && (
                          <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Main
                          </span>
                        )}
                        {!image.is_active && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => move(group, localIndex, -1)}
                            disabled={localIndex === 0 || reorderImages.isPending}
                            title="Move earlier"
                            className="bg-white/90 p-1 text-gray-700 disabled:opacity-40"
                          >
                            <ArrowUp size={13} className="-rotate-90" />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(group, localIndex, 1)}
                            disabled={localIndex === group.images.length - 1 || reorderImages.isPending}
                            title="Move later"
                            className="bg-white/90 p-1 text-gray-700 disabled:opacity-40"
                          >
                            <ArrowDown size={13} className="-rotate-90" />
                          </button>
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => setAsPrimary(image)}
                              disabled={updateImage.isPending}
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
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
