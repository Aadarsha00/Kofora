import api from "@/axios/api.axios";
import {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderListParams,
  AdminOrderListResponse,
  AdminOrderResponse,
  AdminOrderStatusUpdate,
} from "@/interface/admin";
import { PaginatedResponse } from "@/interface/checkout";

export const getAdminOrders = async (
  params: AdminOrderListParams = {}
): Promise<PaginatedResponse<AdminOrderListItem>> => {
  const response = await api.get<AdminOrderListResponse>("/orders/admin/", { params });
  return response.data.data;
};

export const getAdminOrder = async (id: number): Promise<AdminOrderDetail> => {
  const response = await api.get<AdminOrderResponse>(`/orders/admin/${id}/`);
  return response.data.data;
};

export const updateAdminOrderStatus = async (
  id: number,
  payload: AdminOrderStatusUpdate
): Promise<AdminOrderDetail> => {
  const response = await api.patch<AdminOrderResponse>(`/orders/admin/${id}/status/`, payload);
  return response.data.data;
};
