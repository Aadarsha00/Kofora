import { getSiteImages } from "@/api/siteImage.api";
import { SiteImage } from "@/interface/SiteImage";

/** Map of slot key -> uploaded image URL. */
export type SiteImageMap = Record<string, string>;

export function toSiteImageMap(images: SiteImage[]): SiteImageMap {
  const map: SiteImageMap = {};
  for (const item of images) {
    if (item.image) map[item.key] = item.image;
  }
  return map;
}

/** Uploaded image for the slot, or the bundled fallback. */
export function pickImage(
  images: SiteImageMap | undefined,
  key: string,
  fallback: string
): string {
  return images?.[key] || fallback;
}

/**
 * Server-side fetch that never throws: pages render with bundled fallbacks
 * when the backend is unreachable.
 */
export async function fetchSiteImageMap(): Promise<SiteImageMap> {
  try {
    return toSiteImageMap(await getSiteImages());
  } catch {
    return {};
  }
}
