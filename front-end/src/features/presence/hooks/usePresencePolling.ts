import { useQuery } from "@tanstack/react-query";
import { fetchFriends, type Friend } from "../../friends/api/friends";

export type PresenceStatus = "online" | "away" | "recent" | "offline";

function deriveStatus(friend: Friend): PresenceStatus {
  if (!friend.last_online) return "offline";
  const last = new Date(friend.last_online).getTime();
  const now = Date.now();
  const diff = now - last;
  if (diff < 1000 * 60 * 2) return "online"; // within 2 minutes
  if (diff < 1000 * 60 * 15) return "away"; // 2–15 minutes
  if (diff < 1000 * 60 * 60) return "recent"; // 15–60 minutes
  return "offline";
}

export interface FriendWithPresence extends Friend {
  status: PresenceStatus;
}

// Dedicated presence polling separate from general friends query to allow tighter interval.
export function usePresencePolling(intervalMs: number = 30_000) {
  return useQuery<FriendWithPresence[]>({
    queryKey: ["presence", "friends"],
    queryFn: async () => {
      const friends = await fetchFriends();
      return friends.map((f) => ({ ...f, status: deriveStatus(f) }));
    },
    refetchInterval: intervalMs,
    staleTime: intervalMs / 2,
  });
}
