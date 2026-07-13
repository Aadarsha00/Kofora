"use client";

import { ChangeEvent, useRef } from "react";
import { ImagePlus, Loader2, RotateCcw } from "lucide-react";

interface SiteImageCardProps {
  label: string;
  image?: string | null; // uploaded override, if any
  fallback: string; // bundled default shown on the site until an upload exists
  uploading: boolean;
  disabled: boolean;
  onSelect: (file: File) => void;
  onReset: () => void;
}

export default function SiteImageCard({
  label,
  image,
  fallback,
  uploading,
  disabled,
  onSelect,
  onReset,
}: SiteImageCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = image || fallback;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    event.target.value = "";
  };

  return (
    <div className="overflow-hidden border border-gray-200 bg-white">
      <div className="relative h-32 w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {image ? "Uploaded" : "Default"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <p className="min-w-0 truncate text-sm font-bold text-black">{label}</p>

        <div className="flex shrink-0 items-center gap-1.5">
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
            className="inline-flex items-center gap-1.5 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-black hover:border-black disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ImagePlus size={13} />
            )}
            {image ? "Replace" : "Upload"}
          </button>
          {image && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              title="Remove the uploaded image and go back to the default"
              className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:border-black hover:text-black disabled:opacity-50"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
