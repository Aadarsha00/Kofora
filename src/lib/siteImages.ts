import { SiteImage } from "@/interface/SiteImage";

export type SiteImageMap = Record<string, string>;

export function toSiteImageMap(images: SiteImage[]): SiteImageMap {
  const map: SiteImageMap = {};

  for (const item of images) {
    if (item.image) {
      map[item.key] = item.image;
    }
  }

  return map;
}

export function pickImage(
  images: SiteImageMap | undefined,
  key: string,
  fallback: string
): string {
  return images?.[key] || fallback;
}

// The public NEXT_PUBLIC_API_BASE_URL may not be reachable from inside the
// server's own network (e.g. firewalled or loopback-only in production) -
// prefer an internal Docker-network URL when one is configured.
const API_URL =
  process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchSiteImageMap(): Promise<SiteImageMap> {
  try {
    const response = await fetch(`${API_URL}/site-images/`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {};
    }

    const result: { success: boolean; data: SiteImage[] } =
      await response.json();

    return toSiteImageMap(result.data);
  } catch {
    return {};
  }
}
