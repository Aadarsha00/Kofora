import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/api/adminDashboard.api";

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });
