import { api } from "../../../lib/axios";
import type { AxiosResponse } from "axios";

// Backend-aligned types ----------------------------------------------------
export interface BackendFriendUser {
  id: number | string;
  username: string;
  email?: string | null;
  profile_picture_url?: string | null;
  last_online?: string | null;
  friendship_created_at?: string | null; // only present in /friends list
}

export interface Friend extends BackendFriendUser {}

export interface PendingFriendRequest {
  id: string | number; // friendship record id
  user: BackendFriendUser; // sender user info
  created_at: string;
}

// User lookup (single result) ----------------------------------------------
export async function fetchUserByUsername(
  username: string
): Promise<BackendFriendUser | null> {
  if (!username.trim()) return null;
  try {
    const res: AxiosResponse<BackendFriendUser> = await api.get(
      `/users/${encodeURIComponent(username)}`
    );
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

// Friends list --------------------------------------------------------------
export async function fetchFriends(): Promise<Friend[]> {
  const res: AxiosResponse<BackendFriendUser[]> = await api.get("/friends");
  return res.data.map((f) => ({ ...f }));
}

// Pending requests (incoming) ----------------------------------------------
export async function fetchPendingRequests(): Promise<PendingFriendRequest[]> {
  const res: AxiosResponse<any[]> = await api.get("/friends/pending");
  return res.data.map((r) => ({
    id: r.id,
    user: r.user,
    created_at: r.created_at,
  }));
}

// Outgoing (sent) pending requests ----------------------------------------
export interface OutgoingFriendRequest {
  id: string | number;
  user: BackendFriendUser; // the target friend user info
  created_at: string;
}

export async function fetchOutgoingRequests(): Promise<
  OutgoingFriendRequest[]
> {
  const res: AxiosResponse<any[]> = await api.get("/friends/outgoing");
  return res.data.map((r) => ({
    id: r.id,
    user: r.user,
    created_at: r.created_at,
  }));
}

// Send friend request (target user id) -------------------------------------
export async function sendFriendRequestToId(
  targetUserId: string | number
): Promise<any> {
  const res: AxiosResponse<any> = await api.post(`/friends/${targetUserId}`);
  return res.data; // { message, friendship:{ id, status, created_at } }
}

// Accept pending request ----------------------------------------------------
export async function acceptFriendRequest(
  friendshipId: string | number
): Promise<any> {
  const res: AxiosResponse<any> = await api.post(
    `/friends/${friendshipId}/accept`
  );
  return res.data;
}

// Reject pending OR remove existing friend ---------------------------------
export async function deleteFriendship(
  friendshipId: string | number
): Promise<any> {
  const res: AxiosResponse<any> = await api.delete(`/friends/${friendshipId}`);
  return res.data;
}
