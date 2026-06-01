import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrder, getAdminOrders, updateAdminOrderStatus } from "@/api/admin.api";
import { AdminOrderListParams, AdminOrderStatusUpdate } from "@/interface/admin";

export const useAdminOrders = (params: AdminOrderListParams) =>
  useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => getAdminOrders(params),
    placeholderData: keepPreviousData,
  });

export const useAdminOrder = (id: number | undefined) =>
  useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getAdminOrder(id as number),
    enabled: Boolean(id),
  });

export const useUpdateAdminOrderStatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminOrderStatusUpdate) => updateAdminOrderStatus(id, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(["admin-order", id], order);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};
