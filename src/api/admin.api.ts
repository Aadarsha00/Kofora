import api from "@/axios/api.axios";
import {
  AdminCustomer,
  AdminCustomerListParams,
  AdminCustomerListResponse,
  AdminCustomerResponse,
  AdminCustomerStatusInput,
  AdminInventoryAdjustment,
  AdminInventoryAdjustmentInput,
  AdminInventoryAdjustmentListParams,
  AdminInventoryAdjustmentListResponse,
  AdminInventoryAdjustmentResponse,
  AdminInventoryListParams,
  AdminInventoryListResponse,
  AdminInventoryVariant,
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

export const getAdminInventoryVariants = async (
  params: AdminInventoryListParams = {}
): Promise<PaginatedResponse<AdminInventoryVariant>> => {
  const response = await api.get<AdminInventoryListResponse>("/products/variants/", { params });
  return response.data.data;
};

export const getAdminInventoryAdjustments = async (
  params: AdminInventoryAdjustmentListParams = {}
): Promise<PaginatedResponse<AdminInventoryAdjustment>> => {
  const response = await api.get<AdminInventoryAdjustmentListResponse>("/inventory/adjustments/", { params });
  return response.data.data;
};

export const createAdminInventoryAdjustment = async (
  payload: AdminInventoryAdjustmentInput
): Promise<AdminInventoryAdjustment> => {
  const response = await api.post<AdminInventoryAdjustmentResponse>("/inventory/adjustments/", {
    reason: "manual",
    ...payload,
  });
  return response.data.data;
};

export const getAdminCustomers = async (
  params: AdminCustomerListParams = {}
): Promise<PaginatedResponse<AdminCustomer>> => {
  const response = await api.get<AdminCustomerListResponse>("/users/customers/", { params });
  return response.data.data;
};

export const getAdminCustomer = async (id: number): Promise<AdminCustomer> => {
  const response = await api.get<AdminCustomerResponse>(`/users/customers/${id}/`);
  return response.data.data;
};

export const updateAdminCustomerStatus = async (
  id: number,
  payload: AdminCustomerStatusInput
): Promise<AdminCustomer> => {
  const response = await api.patch<AdminCustomerResponse>(`/users/customers/${id}/status/`, payload);
  return response.data.data;
};
