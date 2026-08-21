import { useQuery } from "@tanstack/react-query";
import { getCollab, getCollabs } from "@/api/collab.api";

export function useCollabs() {
  return useQuery({
    queryKey: ["collabs"],
    queryFn: getCollabs,
  });
}

export function useCollab(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["collab", slug],
    queryFn: () => getCollab(slug),
    enabled: enabled && Boolean(slug),
  });
}
