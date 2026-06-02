import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminCustomer, getAdminCustomers, updateAdminCustomerStatus } from "@/api/admin.api";
import { AdminCustomerListParams, AdminCustomerStatusInput } from "@/interface/admin";

export const useAdminCustomers = (params: AdminCustomerListParams) =>
  useQuery({
    queryKey: ["admin-customers", params],
    queryFn: () => getAdminCustomers(params),
    placeholderData: keepPreviousData,
  });

export const useAdminCustomer = (id: number | undefined) =>
  useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => getAdminCustomer(id as number),
    enabled: Boolean(id),
  });

export const useUpdateAdminCustomerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminCustomerStatusInput }) =>
      updateAdminCustomerStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customer", variables.id] });
    },
  });
};
