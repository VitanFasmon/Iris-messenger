import { useQuery } from "@tanstack/react-query";
import { fetchPendingRequests } from "../api/friends";
import type { FriendRequest } from "../api/friends";

export function usePendingRequests() {
  return useQuery<FriendRequest[]>({
    queryKey: ["friendRequests"],
    queryFn: fetchPendingRequests,
    staleTime: 15_000,
    refetchInterval: 45_000,
  });
}
