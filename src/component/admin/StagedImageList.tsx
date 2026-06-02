"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { StagedImage, StagedVariantInput } from "@/interface/admin";

const GENERAL_GROUP = "__general__";

interface FormState {
  file: File | null;
  fileKey: number;
  url: string;
  altText: string;
  makePrimary: boolean;
  groupKey: string;
  groupTouched: boolean;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyForm(groupKey: string): FormState {
  return {
    file: null,
    fileKey: 0,
    url: "",
    altText: "",
    makePrimary: false,
    groupKey,
    groupTouched: false,
  };
}

function groupKey(image: Pick<StagedImage, "color">): string {
  return image.color || GENERAL_GROUP;
}

export default function StagedImageList({
  value,
  onChange,
  variants,
}: {
  value: StagedImage[];
  onChange: (images: StagedImage[]) => void;
  variants: StagedVariantInput[];
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
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultGroupKey));
  const [error, setError] = useState("");

  const promotedGroupKey =
    !form.groupTouched && form.groupKey === GENERAL_GROUP && colorOptions.length > 0
      ? defaultGroupKey
      : form.groupKey;
  const selectedGroupKey =
    promotedGroupKey === GENERAL_GROUP || colorOptions.includes(promotedGroupKey)
      ? promotedGroupKey
      : defaultGroupKey;
  const targetImages = value.filter((image) => groupKey(image) === selectedGroupKey);
  const noExistingImages = targetImages.length === 0;
  const checked = form.makePrimary || noExistingImages;
  const generalImages = value.filter((image) => !image.color);

  const resetForm = () => {
    setForm((current) => ({
      ...emptyForm(
        selectedGroupKey === GENERAL_GROUP || colorOptions.includes(selectedGroupKey)
          ? selectedGroupKey
          : defaultGroupKey
      ),
      groupTouched: true,
      fileKey: current.fileKey + 1,
    }));
  };

  const handleAdd = () => {
    setError("");
    if (!form.file && !form.url.trim()) {
      setError("Choose a file or paste an image URL.");
      return;
    }

    const color = selectedGroupKey === GENERAL_GROUP ? undefined : selectedGroupKey;
    if (selectedGroupKey !== GENERAL_GROUP && !color) {
      setError("Choose a valid variant option for this image.");
      return;
    }

    const isPrimary = form.makePrimary || targetImages.length === 0;
    const staged: StagedImage = {
      id: makeId(),
      file: form.file ?? undefined,
      image_url: form.file ? undefined : form.url.trim(),
      alt_text: form.altText.trim(),
      previewUrl: form.file ? URL.createObjectURL(form.file) : form.url.trim(),
      color,
      is_primary: isPrimary,
    };

    const targetGroupKey = groupKey(staged);
    const nextImages = value.map((image) =>
      isPrimary && groupKey(image) === targetGroupKey ? { ...image, is_primary: false } : image
    );
    onChange([...nextImages, staged]);
    resetForm();
  };

  const handleRemove = (id: string) => {
    const target = value.find((image) => image.id === id);
    if (target?.file) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((image) => image.id !== id));
  };

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-black">Images</h2>
      <p className="mb-4 text-xs text-gray-500">
        Pick which option these photos belong to. Use General only when the photo is not tied to an option.
      </p>

      <div className="border border-gray-200 bg-gray-50 p-4">
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
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
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
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={checked}
              disabled={noExistingImages}
              onChange={(event) =>
                setForm((current) => ({ ...current, makePrimary: event.target.checked }))
              }
            />
            Main image for this option
          </label>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="mt-4 inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-white"
        >
          <Plus size={15} />
          Add image to list
        </button>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {value.length > 0 && (
        <div className="mt-6 space-y-5">
          {colorOptions.map((color) => (
            <StagedGroup
              key={color}
              title={`${color} images`}
              images={value.filter((image) => image.color === color)}
              onRemove={handleRemove}
            />
          ))}
          {(generalImages.length > 0 || colorOptions.length === 0) && (
            <StagedGroup
              title="General / no specific color"
              images={generalImages}
              onRemove={handleRemove}
            />
          )}
        </div>
      )}
    </section>
  );
}

function StagedGroup({
  title,
  images,
  onRemove,
}: {
  title: string;
  images: StagedImage[];
  onRemove: (id: string) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase text-gray-500">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => {
          const isPrimary = image.is_primary || (!images.some((item) => item.is_primary) && index === 0);
          return (
            <div key={image.id} className="group relative aspect-square overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={image.alt_text || "Staged image"} className="h-full w-full object-cover" />
              {isPrimary && (
                <span className="absolute left-1 top-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(image.id)}
                title="Remove"
                className="absolute bottom-1 right-1 bg-white/90 p-1 text-red-700 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
