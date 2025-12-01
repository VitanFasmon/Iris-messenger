import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCounts } from "../api/messages";

export function useUnreadCounts() {
  return useQuery({
    queryKey: ["unread-counts"],
    queryFn: fetchUnreadCounts,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
  });
}
