import { isAxiosError } from "axios";
import api from "@/axios/api.axios";
import { SiteImage } from "@/interface/SiteImage";
import { getApiErrorMessage } from "@/lib/apiError";

function throwApiError(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback));
}

export const getSiteImages = async (): Promise<SiteImage[]> => {
  try {
    // Unpaginated endpoint: `data` is the plain array.
    const response = await api.get<{ success: boolean; data: SiteImage[] }>("/site-images/");
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to load site images");
  }
};

/**
 * Upload an image for a slot. Slots are defined by the frontend, so the row
 * may not exist yet: try PATCH first, create on 404.
 */
export const upsertSiteImage = async (key: string, file: File): Promise<SiteImage> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await api.patch<{ success: boolean; data: SiteImage }>(
      `/site-images/${key}/`,
      formData
    );
    return response.data.data;
  } catch (error: unknown) {
    if (!isAxiosError(error) || error.response?.status !== 404) {
      throwApiError(error, "Failed to upload image");
    }
  }

  try {
    formData.append("key", key);
    const response = await api.post<{ success: boolean; data: SiteImage }>(
      "/site-images/",
      formData
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to upload image");
  }
};

/** Remove the uploaded image so the slot falls back to its bundled default. */
export const deleteSiteImage = async (key: string): Promise<void> => {
  try {
    await api.delete(`/site-images/${key}/`);
  } catch (error: unknown) {
    throwApiError(error, "Failed to reset image");
  }
};
