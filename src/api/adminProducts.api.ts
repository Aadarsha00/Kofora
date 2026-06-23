import api from "@/axios/api.axios";
import { InternationalShipping, Product, ProductVariant } from "@/interface/Product";
import {
  AdminImageUploadInput,
  AdminProductInput,
  AdminProductListParams,
  AdminProductListResponse,
  AdminProductResponse,
  AdminUploadedImage,
  AdminUploadedImageResponse,
  AdminVariantInput,
  AdminVariantResponse,
} from "@/interface/admin";
import { ApiEnvelope } from "@/interface/cart";
import { PaginatedResponse } from "@/interface/checkout";

type InternationalShippingListResponse = ApiEnvelope<PaginatedResponse<InternationalShipping>>;

// ─── Products ─────────────────────────────────────────────────
export const getAdminProducts = async (
  params: AdminProductListParams = {}
): Promise<PaginatedResponse<Product>> => {
  const response = await api.get<AdminProductListResponse>("/products/", { params });
  return response.data.data;
};

export const getAdminProduct = async (id: number): Promise<Product> => {
  const response = await api.get<AdminProductResponse>(`/products/${id}/`);
  return response.data.data;
};

export const createAdminProduct = async (payload: AdminProductInput): Promise<Product> => {
  const response = await api.post<AdminProductResponse>("/products/", payload);
  return response.data.data;
};

export const updateAdminProduct = async (
  id: number,
  payload: Partial<AdminProductInput>
): Promise<Product> => {
  const response = await api.patch<AdminProductResponse>(`/products/${id}/`, payload);
  return response.data.data;
};

export const deleteAdminProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}/`);
};

export const getInternationalShippingOptions = async (): Promise<InternationalShipping[]> => {
  const response = await api.get<InternationalShippingListResponse>("/shipping/international/", {
    params: { page_size: 100, ordering: "sort_order" },
  });
  return response.data.data.results ?? [];
};

// ─── Variants ─────────────────────────────────────────────────
export const createAdminVariant = async (payload: AdminVariantInput): Promise<ProductVariant> => {
  const response = await api.post<AdminVariantResponse>("/products/variants/", payload);
  return response.data.data;
};

export const updateAdminVariant = async (
  id: number,
  payload: Partial<AdminVariantInput>
): Promise<ProductVariant> => {
  const response = await api.patch<AdminVariantResponse>(`/products/variants/${id}/`, payload);
  return response.data.data;
};

export const deleteAdminVariant = async (id: number): Promise<void> => {
  await api.delete(`/products/variants/${id}/`);
};

// ─── Images ───────────────────────────────────────────────────
export const uploadProductImage = async (
  payload: AdminImageUploadInput
): Promise<AdminUploadedImage> => {
  if (payload.image) {
    const form = new FormData();
    form.append("product", String(payload.product));
    form.append("image", payload.image);
    if (payload.alt_text) form.append("alt_text", payload.alt_text);
    if (payload.sort_order != null) form.append("sort_order", String(payload.sort_order));
    if (payload.is_primary != null) form.append("is_primary", String(payload.is_primary));
    if (payload.is_active != null) form.append("is_active", String(payload.is_active));
    if (payload.variant_id != null) form.append("variant_id", String(payload.variant_id));
    const response = await api.post<AdminUploadedImageResponse>("/products/images/upload/", form);
    return response.data.data;
  }

  const response = await api.post<AdminUploadedImageResponse>("/products/images/upload/", {
    product: payload.product,
    image_url: payload.image_url,
    alt_text: payload.alt_text,
    sort_order: payload.sort_order,
    is_primary: payload.is_primary,
    is_active: payload.is_active,
    variant_id: payload.variant_id ?? null,
  });
  return response.data.data;
};

export const updateProductImage = async (
  id: number,
  payload: { sort_order?: number; is_primary?: boolean; is_active?: boolean; alt_text?: string; variant_id?: number | null }
): Promise<AdminUploadedImage> => {
  const response = await api.patch<AdminUploadedImageResponse>(`/products/images/${id}/`, payload);
  return response.data.data;
};

// Reindexes every image's sort_order to match the given id order.
export const reorderProductImages = async (orderedIds: number[]): Promise<void> => {
  await Promise.all(
    orderedIds.map((id, index) => api.patch(`/products/images/${id}/`, { sort_order: index }))
  );
};

export const deleteProductImage = async (id: number): Promise<void> => {
  await api.delete(`/products/images/${id}/`);
};
