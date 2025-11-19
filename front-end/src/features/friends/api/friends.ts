import { api } from "../../../lib/axios";
import type { AxiosResponse } from "axios";

// --- Types (can be moved to a shared types file later) ---
export interface Friend {
  id: string;
  username: string;
  profile_picture_url?: string | null;
  last_online?: string | null; // ISO date string
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_username?: string;
  to_username?: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  profile_picture_url?: string | null;
}

export interface SendFriendRequestPayload {
  username: string;
}

// Response wrappers
interface Paginated<T> {
  data: T[];
  meta?: { page?: number; per_page?: number; total?: number };
}

// --- API calls ---
// NOTE: Endpoint paths are assumptions; adjust to match backend when confirmed.
export async function fetchFriends(): Promise<Friend[]> {
  const res: AxiosResponse<Friend[]> = await api.get("/friends");
  return res.data;
}

export async function fetchPendingRequests(): Promise<FriendRequest[]> {
  const res: AxiosResponse<FriendRequest[]> = await api.get(
    "/friends/requests"
  );
  return res.data;
}

export async function sendFriendRequest(
  payload: SendFriendRequestPayload
): Promise<FriendRequest> {
  const res: AxiosResponse<FriendRequest> = await api.post(
    "/friends/requests",
    payload
  );
  return res.data;
}

export async function acceptFriendRequest(
  requestId: string
): Promise<FriendRequest> {
  const res: AxiosResponse<FriendRequest> = await api.post(
    `/friends/requests/${requestId}/accept`
  );
  return res.data;
}

export async function rejectFriendRequest(
  requestId: string
): Promise<FriendRequest> {
  const res: AxiosResponse<FriendRequest> = await api.post(
    `/friends/requests/${requestId}/reject`
  );
  return res.data;
}

export async function removeFriend(
  friendId: string
): Promise<{ success: boolean }> {
  const res: AxiosResponse<{ success: boolean }> = await api.delete(
    `/friends/${friendId}`
  );
  return res.data;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];
  const res: AxiosResponse<Paginated<UserSearchResult>> = await api.get(
    "/users/search",
    { params: { q: query } }
  );
  return res.data.data;
}
