import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminInventoryAdjustment,
  getAdminInventoryAdjustments,
  getAdminInventoryVariants,
} from "@/api/admin.api";
import {
  AdminInventoryAdjustmentInput,
  AdminInventoryAdjustmentListParams,
  AdminInventoryListParams,
} from "@/interface/admin";

export const useAdminInventoryVariants = (params: AdminInventoryListParams) =>
  useQuery({
    queryKey: ["admin-inventory-variants", params],
    queryFn: () => getAdminInventoryVariants(params),
    placeholderData: keepPreviousData,
  });

export const useAdminInventoryAdjustments = (params: AdminInventoryAdjustmentListParams) =>
  useQuery({
    queryKey: ["admin-inventory-adjustments", params],
    queryFn: () => getAdminInventoryAdjustments(params),
    placeholderData: keepPreviousData,
  });

export const useCreateAdminInventoryAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminInventoryAdjustmentInput) => createAdminInventoryAdjustment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-variants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};
