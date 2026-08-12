import api from "@/axios/api.axios";
import {
  ShippingMethod,
  ShippingMethodInput,
  ShippingMethodListResponse,
  ShippingMethodResponse,
} from "@/interface/checkout";

export const getAdminShippingMethods = async (): Promise<ShippingMethod[]> => {
  const response = await api.get<ShippingMethodListResponse>("/shipping/methods/?page_size=100");
  return response.data.data.results ?? [];
};

export const updateAdminShippingMethod = async (
  id: number,
  payload: ShippingMethodInput
): Promise<ShippingMethod> => {
  const response = await api.patch<ShippingMethodResponse>(`/shipping/methods/${id}/`, payload);
  return response.data.data;
};
