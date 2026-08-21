"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { updateCategoryImage } from "@/api/category.api";
import {
  clearSiteMedia,
  deleteSiteImage,
  SiteMediaKind,
  upsertSiteImage,
} from "@/api/siteImage.api";
import { useCategories } from "@/hooks/useCategories";
import { useSiteImages } from "@/hooks/useSiteImages";
import { SiteImage } from "@/interface/SiteImage";
import { getApiErrorMessage } from "@/lib/apiError";
import { flattenCategories, TaxonomyCategoryOption } from "@/lib/productTaxonomy";
import { HOME_IMAGE_SECTIONS } from "@/data/HomeData";
import { LOCAL_HERO_IMAGES } from "@/component/Gender/HeroGender";
import HeroImageCard from "@/component/admin/HeroImageCard";
import SiteImageCard from "@/component/admin/SiteImageCard";
import HomepageTileManager from "@/component/admin/HomepageTileManager";

type Tab = "homepage-tiles" | "landing" | "collections";

export default function AdminImagesPage() {
  const [tab, setTab] = useState<Tab>("homepage-tiles");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-black">Images</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage homepage tiles and the other media shown across the storefront,
          organized by where they appear. The main hero also takes a looping
          video in place of its photo.
        </p>
        <div className="mt-4 flex gap-2">
          <TabButton active={tab === "homepage-tiles"} onClick={() => setTab("homepage-tiles")}>
            Homepage Tiles
          </TabButton>
          <TabButton active={tab === "landing"} onClick={() => setTab("landing")}>
            Other Landing Images
          </TabButton>
          <TabButton active={tab === "collections"} onClick={() => setTab("collections")}>
            Collection Banners
          </TabButton>
        </div>
      </div>

      {tab === "homepage-tiles" ? (
        <HomepageTileManager />
      ) : tab === "landing" ? (
        <LandingImagesTab />
      ) : (
        <CollectionImagesTab />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-black text-white" : "border border-gray-300 text-gray-700 hover:border-black"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Landing page slots                                                  */
/* ------------------------------------------------------------------ */

function LandingImagesTab() {
  const queryClient = useQueryClient();
  const { data: siteImages, isLoading } = useSiteImages();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // Keyed by slot so a card can show both halves (photo and video) of its row.
  const slotByKey = useMemo(() => {
    const map = new Map<string, SiteImage>();
    for (const item of siteImages ?? []) map.set(item.key, item);
    return map;
  }, [siteImages]);

  const uploadMutation = useMutation({
    mutationFn: ({ key, file, kind }: { key: string; file: File; kind: SiteMediaKind }) =>
      upsertSiteImage(key, file, kind),
    onMutate: ({ key }) => {
      setBusyKey(key);
      setMessage("");
      setError("");
    },
    onSuccess: (_data, { kind }) => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      setMessage(
        `${kind === "video" ? "Video" : "Image"} updated. The homepage may take a few minutes to refresh.`
      );
    },
    onError: (err) => setError(getApiErrorMessage(err, "Failed to upload file.")),
    onSettled: () => setBusyKey(null),
  });

  const resetMutation = useMutation({
    mutationFn: (key: string) => deleteSiteImage(key),
    onMutate: (key) => {
      setBusyKey(key);
      setMessage("");
      setError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      setMessage("Slot reset to the default image.");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Failed to reset image.")),
    onSettled: () => setBusyKey(null),
  });

  // Dropping the video keeps the photo, so it is a field clear rather than a
  // row delete - unless the video is all the row has.
  const removeVideoMutation = useMutation({
    mutationFn: ({ key, hasImage }: { key: string; hasImage: boolean }) =>
      hasImage ? clearSiteMedia(key, "video").then(() => undefined) : deleteSiteImage(key),
    onMutate: ({ key }) => {
      setBusyKey(key);
      setMessage("");
      setError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      setMessage("Video removed. The photo is live again.");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Failed to remove video.")),
    onSettled: () => setBusyKey(null),
  });

  const busy =
    uploadMutation.isPending || resetMutation.isPending || removeVideoMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Sections are listed in the same order they appear on the homepage, top to bottom.
        </p>
        <Link
          href="/"
          target="_blank"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-black hover:underline"
        >
          Open homepage
          <ExternalLink size={13} />
        </Link>
      </div>

      {(message || error) && (
        <p className={`text-sm font-semibold ${error ? "text-red-600" : "text-green-700"}`}>
          {error || message}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading images…</p>
      ) : (
        HOME_IMAGE_SECTIONS.map((section, index) => (
          <section key={section.title}>
            <div className="mb-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                {index + 1}. {section.title}
              </h2>
              <p className="mt-0.5 text-sm text-gray-400">{section.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.slots.map((slot) => {
                const row = slotByKey.get(slot.key);
                return (
                  <SiteImageCard
                    key={slot.key}
                    label={slot.label}
                    image={row?.image}
                    video={row?.video}
                    allowsVideo={slot.allowsVideo}
                    fallback={slot.fallback}
                    uploading={busyKey === slot.key}
                    disabled={busy}
                    onSelect={(file, kind) =>
                      uploadMutation.mutate({ key: slot.key, file, kind })
                    }
                    onReset={() => resetMutation.mutate(slot.key)}
                    onRemoveVideo={() =>
                      removeVideoMutation.mutate({
                        key: slot.key,
                        hasImage: Boolean(row?.image),
                      })
                    }
                  />
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Collection hero banners (category-driven)                           */
/* ------------------------------------------------------------------ */

const GROUP_LABELS: Record<string, string> = {
  product_family: "Product Family",
  audience: "Audience",
  height: "Height",
  purpose: "Purpose",
  "": "Other",
};

const GROUP_ORDER = ["product_family", "audience", "height", "purpose", ""];

function CollectionImagesTab() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const options = flattenCategories(categories);
    const buckets = new Map<string, TaxonomyCategoryOption[]>();
    for (const option of options) {
      const key = option.taxonomyGroup ?? "";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(option);
    }
    return GROUP_ORDER.filter((key) => buckets.has(key)).map((key) => ({
      key,
      label: GROUP_LABELS[key] ?? "Other",
      options: buckets.get(key)!,
    }));
  }, [categories]);

  const imageMutation = useMutation({
    mutationFn: ({ slug, file }: { slug: string; file: File }) =>
      updateCategoryImage(slug, file),
    onMutate: ({ slug }) => {
      setUploadingSlug(slug);
      setMessage("");
      setError("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setMessage("Hero image updated.");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Failed to upload image.")),
    onSettled: () => setUploadingSlug(null),
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500">
        The banner at the top of each collection page. The preview matches the
        live site — click a card&apos;s link to open the real page. A{" "}
        <span className="font-semibold">Default</span> badge means it still uses
        a built-in image; <span className="font-semibold">Uploaded</span> means
        your image is live.
      </p>

      {(message || error) && (
        <p className={`text-sm font-semibold ${error ? "text-red-600" : "text-green-700"}`}>
          {error || message}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading categories…</p>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        grouped.map((group) => (
          <section key={group.key}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                {group.label}
              </h2>
              <span className="text-xs font-semibold text-gray-400">
                {group.options.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.options.map((option) => (
                <HeroImageCard
                  key={option.id}
                  name={option.label}
                  slug={option.value}
                  image={option.image}
                  fallbackImage={LOCAL_HERO_IMAGES[option.value]}
                  uploading={uploadingSlug === option.value}
                  disabled={imageMutation.isPending}
                  onSelect={(file) =>
                    imageMutation.mutate({ slug: option.value, file })
                  }
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
