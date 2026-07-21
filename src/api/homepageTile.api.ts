import api from "@/axios/api.axios";
import { HomepageTile, HomepageTileInput } from "@/interface/HomepageTile";
import { getApiErrorMessage } from "@/lib/apiError";

function throwApiError(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback));
}

function toFormData(payload: Partial<HomepageTileInput>) {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.href !== undefined) formData.append("href", payload.href);
  if (payload.alt_text !== undefined) formData.append("alt_text", payload.alt_text);
  if (payload.sort_order !== undefined) {
    formData.append("sort_order", String(payload.sort_order));
  }
  if (payload.is_active !== undefined) {
    formData.append("is_active", String(payload.is_active));
  }
  if (payload.image) formData.append("image", payload.image);
  return formData;
}

export async function getHomepageTiles(): Promise<HomepageTile[]> {
  try {
    const response = await api.get<{ success: boolean; data: HomepageTile[] }>(
      "/homepage-tiles/"
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to load homepage tiles");
  }
}

export async function createHomepageTile(
  payload: HomepageTileInput
): Promise<HomepageTile> {
  try {
    const response = await api.post<{ success: boolean; data: HomepageTile }>(
      "/homepage-tiles/",
      toFormData(payload)
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to create homepage tile");
  }
}

export async function updateHomepageTile(
  id: number,
  payload: Partial<HomepageTileInput>
): Promise<HomepageTile> {
  try {
    const response = await api.patch<{ success: boolean; data: HomepageTile }>(
      `/homepage-tiles/${id}/`,
      toFormData(payload)
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to update homepage tile");
  }
}

export async function deleteHomepageTile(id: number): Promise<void> {
  try {
    await api.delete(`/homepage-tiles/${id}/`);
  } catch (error: unknown) {
    throwApiError(error, "Failed to delete homepage tile");
  }
}
