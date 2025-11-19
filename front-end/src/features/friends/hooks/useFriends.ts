import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFriends,
  fetchPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  type Friend,
  type FriendRequest,
  type SendFriendRequestPayload,
  type UserSearchResult,
} from "../api/friends";

// Query Keys
const FRIENDS_KEY = ["friends"];
const REQUESTS_KEY = ["friendRequests"];
const SEARCH_KEY = (q: string) => ["userSearch", q];

export function useFriends() {
  return useQuery<Friend[]>({
    queryKey: FRIENDS_KEY,
    queryFn: fetchFriends,
    staleTime: 30_000,
    refetchInterval: 60_000, // light polling as fallback until presence handled separately
  });
}

export function useFriendRequests() {
  return useQuery<FriendRequest[]>({
    queryKey: REQUESTS_KEY,
    queryFn: fetchPendingRequests,
    staleTime: 15_000,
    refetchInterval: 45_000,
  });
}

export function useUserSearch(query: string) {
  return useQuery<UserSearchResult[]>({
    enabled: !!query && query.length > 1,
    queryKey: SEARCH_KEY(query),
    queryFn: () => searchUsers(query),
    staleTime: 5_000,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendFriendRequestPayload) =>
      sendFriendRequest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptFriendRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUESTS_KEY });
      qc.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}

export function useRejectFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectFriendRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeFriend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });
}
