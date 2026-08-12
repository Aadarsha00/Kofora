import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminShippingMethods, updateAdminShippingMethod } from "@/api/adminShipping.api";
import { ShippingMethodInput } from "@/interface/checkout";

export const useAdminShippingMethods = () =>
  useQuery({
    queryKey: ["admin-shipping-methods"],
    queryFn: getAdminShippingMethods,
  });

export const useUpdateAdminShippingMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ShippingMethodInput }) =>
      updateAdminShippingMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
      // Storefront reads the same endpoint for checkout - keep it in sync too.
      queryClient.invalidateQueries({ queryKey: ["shipping-methods"] });
    },
  });
};
