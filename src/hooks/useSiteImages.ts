import { useQuery } from "@tanstack/react-query";
import { getSiteImages } from "@/api/siteImage.api";

export const useSiteImages = () => {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: getSiteImages,
  });
};
