import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminProduct,
  createAdminVariant,
  deleteAdminProduct,
  deleteAdminVariant,
  deleteProductImage,
  getAdminProduct,
  getAdminProducts,
  getInternationalShippingOptions,
  reorderProductImages,
  updateProductImage,
  updateAdminProduct,
  updateAdminVariant,
  uploadProductImage,
} from "@/api/adminProducts.api";
import {
  AdminImageUploadInput,
  AdminProductInput,
  AdminProductListParams,
  AdminVariantInput,
} from "@/interface/admin";

export const useAdminProducts = (params: AdminProductListParams) =>
  useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => getAdminProducts(params),
    placeholderData: keepPreviousData,
  });

export const useAdminProduct = (id: number | undefined) =>
  useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getAdminProduct(id as number),
    enabled: Boolean(id),
  });

export const useInternationalShippingOptions = () =>
  useQuery({
    queryKey: ["international-shipping-options"],
    queryFn: getInternationalShippingOptions,
  });

export const useCreateAdminProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminProductInput) => createAdminProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });
};

export const useUpdateAdminProduct = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AdminProductInput>) => updateAdminProduct(id, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(["admin-product", id], product);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useDeleteAdminProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });
};

// Variant + image mutations refresh the owning product's detail query.
export const useSaveAdminVariant = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: AdminVariantInput }) =>
      id ? updateAdminVariant(id, payload) : createAdminVariant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useDeleteAdminVariant = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useUploadProductImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminImageUploadInput) => uploadProductImage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useDeleteProductImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useReorderProductImages = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: number[]) => reorderProductImages(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useUpdateProductImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { sort_order?: number; is_primary?: boolean; is_active?: boolean; alt_text?: string; variant_id?: number | null };
    }) => updateProductImage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};
