import { useQuery } from "@tanstack/react-query";
import {
  fetchPendingRequests,
  type PendingFriendRequest,
} from "../api/friends";

// Legacy wrapper retained for backwards compatibility; prefer useFriendRequests in useFriends.ts
export function usePendingRequests() {
  return useQuery<PendingFriendRequest[]>({
    queryKey: ["friendRequests"],
    queryFn: fetchPendingRequests,
    staleTime: 15_000,
    refetchInterval: 45_000,
  });
}
