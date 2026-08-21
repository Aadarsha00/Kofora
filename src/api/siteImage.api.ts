import { isAxiosError } from "axios";
import api from "@/axios/api.axios";
import { SiteImage } from "@/interface/SiteImage";
import { getApiErrorMessage } from "@/lib/apiError";

function throwApiError(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback));
}

export const getSiteImages = async (): Promise<SiteImage[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/site-images/`,
    {
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load site images");
  }

  const result: { success: boolean; data: SiteImage[] } =
    await response.json();

  return result.data;
};

export type SiteMediaKind = "image" | "video";

/**
 * Upload a picture or a video for a slot. Slots are defined by the frontend,
 * so the row may not exist yet: try PATCH first, create on 404. The two kinds
 * live in separate columns, so uploading a video leaves the photo in place as
 * the poster frame.
 */
export const upsertSiteImage = async (
  key: string,
  file: File,
  kind: SiteMediaKind = "image"
): Promise<SiteImage> => {
  const body = () => {
    const formData = new FormData();
    formData.append(kind, file);
    return formData;
  };

  try {
    const response = await api.patch<{ success: boolean; data: SiteImage }>(
      `/site-images/${key}/`,
      body()
    );
    return response.data.data;
  } catch (error: unknown) {
    if (!isAxiosError(error) || error.response?.status !== 404) {
      throwApiError(error, `Failed to upload ${kind}`);
    }
  }

  try {
    const formData = body();
    formData.append("key", key);
    const response = await api.post<{ success: boolean; data: SiteImage }>(
      "/site-images/",
      formData
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, `Failed to upload ${kind}`);
  }
};

/**
 * Clear one half of a slot while keeping the other. An empty multipart value
 * is how DRF receives null for a file field.
 */
export const clearSiteMedia = async (
  key: string,
  kind: SiteMediaKind
): Promise<SiteImage> => {
  const formData = new FormData();
  formData.append(kind, "");

  try {
    const response = await api.patch<{ success: boolean; data: SiteImage }>(
      `/site-images/${key}/`,
      formData
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, `Failed to remove ${kind}`);
  }
};

/** Remove the whole slot so it falls back to its bundled default. */
export const deleteSiteImage = async (key: string): Promise<void> => {
  try {
    await api.delete(`/site-images/${key}/`);
  } catch (error: unknown) {
    throwApiError(error, "Failed to reset image");
  }
};
