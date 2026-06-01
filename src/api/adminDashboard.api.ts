import api from "@/axios/api.axios";
import { DashboardResponse, DashboardSummary } from "@/interface/admin";

export const getAdminDashboard = async (): Promise<DashboardSummary> => {
  const response = await api.get<DashboardResponse>("/analytics/admin/dashboard/");
  return response.data.data;
};
