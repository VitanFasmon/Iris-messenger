import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFriends,
  fetchPendingRequests,
  fetchOutgoingRequests,
  fetchUserByUsername,
  sendFriendRequestToId,
  acceptFriendRequest,
  deleteFriendship,
  type Friend,
  type PendingFriendRequest,
  type OutgoingFriendRequest,
  type BackendFriendUser,
} from "../api/friends";

// Query Keys ---------------------------------------------------------------
const FRIENDS_KEY = ["friends"];
const REQUESTS_KEY = ["friendRequests"];
const OUTGOING_KEY = ["friendRequestsOutgoing"];
const USER_LOOKUP_KEY = (username: string) => ["userLookup", username];

export function useFriends() {
  return useQuery<Friend[]>({
    queryKey: FRIENDS_KEY,
    queryFn: fetchFriends,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useFriendRequests() {
  return useQuery<PendingFriendRequest[]>({
    queryKey: REQUESTS_KEY,
    queryFn: fetchPendingRequests,
    staleTime: 15_000,
    refetchInterval: 45_000,
  });
}

export function useOutgoingFriendRequests() {
  return useQuery<OutgoingFriendRequest[]>({
    queryKey: OUTGOING_KEY,
    queryFn: fetchOutgoingRequests,
    staleTime: 15_000,
    refetchInterval: 45_000,
  });
}

export function useUserLookup(username: string) {
  return useQuery<BackendFriendUser | null>({
    enabled: !!username && username.length > 1,
    queryKey: USER_LOOKUP_KEY(username),
    queryFn: () => fetchUserByUsername(username),
    staleTime: 10_000,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string | number) =>
      sendFriendRequestToId(targetUserId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUESTS_KEY });
      qc.invalidateQueries({ queryKey: OUTGOING_KEY });
    },
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: string | number) =>
      acceptFriendRequest(friendshipId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUESTS_KEY });
      qc.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}

export function useRejectOrRemoveFriendship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: string | number) =>
      deleteFriendship(friendshipId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUESTS_KEY });
      qc.invalidateQueries({ queryKey: OUTGOING_KEY });
      qc.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}
