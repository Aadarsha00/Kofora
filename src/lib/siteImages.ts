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

export async function fetchSiteImageMap(): Promise<SiteImageMap> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/site-images/`,
      {
        next: { revalidate: 300 },
      }
    );

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
