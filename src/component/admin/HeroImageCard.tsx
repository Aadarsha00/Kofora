"use client";

import { ChangeEvent, useRef } from "react";
import Link from "next/link";
import { ExternalLink, ImagePlus, Loader2 } from "lucide-react";

interface HeroImageCardProps {
  name: string;
  slug: string;
  image?: string | null;
  fallbackImage?: string | null;
  uploading: boolean;
  disabled: boolean;
  onSelect: (file: File) => void;
}

export default function HeroImageCard({
  name,
  slug,
  image,
  fallbackImage,
  uploading,
  disabled,
  onSelect,
}: HeroImageCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewImage = image || fallbackImage || null;
  const usingFallback = !image && Boolean(fallbackImage);
  const href = `/collections/${slug}`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    event.target.value = "";
  };

  return (
    <div className="overflow-hidden border border-gray-200 bg-white">
      {/* Banner preview — mirrors the live hero (dark overlay + centered name). */}
      <div className="relative h-36 w-full overflow-hidden bg-gray-100">
        {previewImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewImage}
            alt={`${name} hero`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold capitalize tracking-tight text-white">
            {name}
          </span>
        </div>
        {previewImage && (
          <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {usingFallback ? "Default" : "Uploaded"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-black">{name}</p>
          <Link
            href={href}
            target="_blank"
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black hover:underline"
          >
            {href}
            <ExternalLink size={11} />
          </Link>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1.5 border border-gray-300 px-3 py-2 text-xs font-semibold text-black hover:border-black disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ImagePlus size={13} />
          )}
          {image ? "Replace" : "Upload"}
        </button>
      </div>
    </div>
  );
}
