"use client";

import { ChangeEvent, useRef } from "react";
import { Film, ImagePlus, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { SiteMediaKind } from "@/api/siteImage.api";

interface SiteImageCardProps {
  label: string;
  image?: string | null; // uploaded override, if any
  fallback: string; // bundled default shown on the site until an upload exists
  /** Uploaded background video, for slots that support one. */
  video?: string | null;
  /** Whether this slot's section can play a video instead of the photo. */
  allowsVideo?: boolean;
  uploading: boolean;
  disabled: boolean;
  onSelect: (file: File, kind: SiteMediaKind) => void;
  onReset: () => void;
  onRemoveVideo?: () => void;
}

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/ogg";

export default function SiteImageCard({
  label,
  image,
  fallback,
  video,
  allowsVideo = false,
  uploading,
  disabled,
  onSelect,
  onReset,
  onRemoveVideo,
}: SiteImageCardProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const preview = image || fallback;

  const pick =
    (kind: SiteMediaKind) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) onSelect(file, kind);
      event.target.value = "";
    };

  return (
    <div className="overflow-hidden border border-gray-200 bg-white">
      <div className="relative h-32 w-full overflow-hidden bg-gray-100">
        {/* A video wins on the live site, so preview that when one exists. */}
        {video ? (
          <video
            src={video}
            poster={image || fallback}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {video ? "Video" : image ? "Uploaded" : "Default"}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-bold text-black">{label}</p>

          <div className="flex shrink-0 items-center gap-1.5">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={pick("image")}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
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
            {(image || video) && (
              <button
                type="button"
                onClick={onReset}
                disabled={disabled}
                title="Remove everything uploaded here and go back to the default image"
                className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:border-black hover:text-black disabled:opacity-50"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {allowsVideo && (
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
            <p className="min-w-0 truncate text-xs text-gray-500">
              {video
                ? "Video is live — the photo is its poster frame."
                : "Optional looping video (MP4 or WebM)."}
            </p>

            <div className="flex shrink-0 items-center gap-1.5">
              <input
                ref={videoInputRef}
                type="file"
                accept={VIDEO_ACCEPT}
                onChange={pick("video")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-black hover:border-black disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Film size={13} />
                )}
                {video ? "Replace video" : "Upload video"}
              </button>
              {video && onRemoveVideo && (
                <button
                  type="button"
                  onClick={onRemoveVideo}
                  disabled={disabled}
                  title="Remove the video and go back to the photo"
                  className="inline-flex items-center gap-1 border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:border-black hover:text-black disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
