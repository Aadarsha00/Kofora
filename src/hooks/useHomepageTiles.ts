import { useQuery } from "@tanstack/react-query";
import { getHomepageTiles } from "@/api/homepageTile.api";

export function useHomepageTiles() {
  return useQuery({
    queryKey: ["homepage-tiles"],
    queryFn: getHomepageTiles,
  });
}
