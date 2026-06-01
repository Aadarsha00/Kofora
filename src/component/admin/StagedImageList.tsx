"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { StagedImage } from "@/interface/admin";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function StagedImageList({
  value,
  onChange,
  colors,
}: {
  value: StagedImage[];
  onChange: (images: StagedImage[]) => void;
  colors: string[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setFile(null);
    setFileKey((key) => key + 1);
    setUrl("");
    setAltText("");
    setColor("");
  };

  const handleAdd = () => {
    setError("");
    if (!file && !url.trim()) {
      setError("Choose a file or paste an image URL.");
      return;
    }
    const staged: StagedImage = {
      id: makeId(),
      file: file ?? undefined,
      image_url: file ? undefined : url.trim(),
      alt_text: altText.trim(),
      previewUrl: file ? URL.createObjectURL(file) : url.trim(),
      color: color || undefined,
    };
    onChange([...value, staged]);
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
        The first image becomes the main one. You can reorder and assign images to variants after the product is created.
      </p>

      {value.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((image, index) => (
            <div key={image.id} className="group relative aspect-square overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={image.alt_text || "Staged image"} className="h-full w-full object-cover" />
              <div className="absolute left-1 top-1 flex flex-col gap-1">
                {index === 0 && !image.color && (
                  <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>
                )}
                {image.color && (
                  <span className="rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-white">
                    {image.color}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                title="Remove"
                className="absolute bottom-1 right-1 bg-white/90 p-1 text-red-700 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

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
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
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
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
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
            {colors.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      {colors.length === 0 && (
        <p className="mt-2 text-xs text-gray-400">Add variants above to assign images to specific colours.</p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50"
        >
          <Plus size={15} />
          Add image to list
        </button>
        {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
      </div>
    </section>
  );
}
