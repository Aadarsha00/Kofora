import api from "@/axios/api.axios";
import { Collab, CollabDetail, CollabInput } from "@/interface/Collab";
import { getApiErrorMessage } from "@/lib/apiError";

function throwApiError(error: unknown, fallback: string): never {
  throw new Error(getApiErrorMessage(error, fallback));
}

function toFormData(payload: Partial<CollabInput>) {
  const formData = new FormData();

  const textFields: (keyof CollabInput)[] = [
    "name",
    "partner_name",
    "tagline",
    "description",
    "accent_color",
    "text_color",
    "cta_label",
  ];
  for (const field of textFields) {
    const value = payload[field];
    if (value !== undefined) formData.append(field, String(value));
  }

  // Blank clears the date on the backend; null/undefined leaves it alone.
  for (const field of ["starts_at", "ends_at"] as const) {
    const value = payload[field];
    if (value !== undefined) formData.append(field, value ?? "");
  }

  for (const field of ["is_active", "show_on_homepage", "sort_order"] as const) {
    const value = payload[field];
    if (value !== undefined) formData.append(field, String(value));
  }

  // An empty product list still needs to be sent, otherwise "remove them all"
  // is indistinguishable from "leave them alone".
  if (payload.product_ids !== undefined) {
    if (payload.product_ids.length === 0) {
      formData.append("product_ids", "");
    } else {
      for (const id of payload.product_ids) formData.append("product_ids", String(id));
    }
  }

  for (const field of ["logo", "banner_image", "hero_image"] as const) {
    const file = payload[field];
    if (file) formData.append(field, file);
  }

  return formData;
}

export async function getCollabs(): Promise<Collab[]> {
  try {
    const response = await api.get<{ success: boolean; data: Collab[] }>("/collabs/");
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to load collabs");
  }
}

export async function getCollab(slug: string): Promise<CollabDetail> {
  try {
    const response = await api.get<{ success: boolean; data: CollabDetail }>(
      `/collabs/${slug}/`
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to load collab");
  }
}

export async function createCollab(payload: CollabInput): Promise<Collab> {
  try {
    const response = await api.post<{ success: boolean; data: Collab }>(
      "/collabs/",
      toFormData(payload)
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to create collab");
  }
}

export async function updateCollab(
  slug: string,
  payload: Partial<CollabInput>
): Promise<Collab> {
  try {
    const response = await api.patch<{ success: boolean; data: Collab }>(
      `/collabs/${slug}/`,
      toFormData(payload)
    );
    return response.data.data;
  } catch (error: unknown) {
    throwApiError(error, "Failed to update collab");
  }
}

export async function deleteCollab(slug: string): Promise<void> {
  try {
    await api.delete(`/collabs/${slug}/`);
  } catch (error: unknown) {
    throwApiError(error, "Failed to delete collab");
  }
}

/**
 * Homepage payload: the list endpoint omits products to stay light, so pull
 * the detail record for each collab the homepage will actually render.
 */
export async function getHomepageCollabs(): Promise<CollabDetail[]> {
  const collabs = await getCollabs();
  const featured = collabs
    .filter((collab) => collab.is_live && collab.show_on_homepage)
    .sort((a, b) => a.sort_order - b.sort_order);

  const details = await Promise.all(
    featured.map((collab) => getCollab(collab.slug).catch(() => null))
  );
  return details.filter((collab): collab is CollabDetail => collab !== null);
}
