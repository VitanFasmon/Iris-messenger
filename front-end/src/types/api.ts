// Domain models and API response types for Iris Messenger
// See FRONT_END_PLAN.md for backend field mapping and usage notes

/**
 * User model for frontend, mirrors backend JSON.
 * profile_picture_url is used for avatar display and cache busting.
 */
export interface User {
  id: number;
  username: string;
  email: string | null;
  profile_picture_url: string | null;
  last_online: string | null; // ISO date string
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Friend {
  id: number;
  username: string;
  profile_picture_url: string | null;
  last_online: string | null;
}

export interface FriendRequest {
  id: number;
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

// Rich message API shape (transitional: existing fields + planned expiry/meta fields)
export interface MessageApi {
  id: number;
  sender_id: number;
  conversation_id: number;
  content: string | null;
  attachment_url: string | null;
  sent_at: string; // ISO timestamp
  deleted_at?: string | null;
  delete_after?: number | null; // seconds until auto-delete (optional backend support)
  expires_at?: string | null; // ISO timestamp after which message should disappear
  is_deleted?: boolean; // backend flag when removed server-side
}

// Client-enriched message used in UI layers
export interface Message extends MessageApi {
  localStatus?: "sending" | "sent" | "failed";
  remainingSeconds?: number | null; // derived from expires_at
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message: MessageApi | null; // keep raw API version for previews
  unread_count: number;
  created_at: string;
}

export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Mapping utilities ---------------------------------------------------------
export function mapMessageApiToMessage(m: MessageApi): Message {
  return {
    ...m,
    remainingSeconds: computeRemaining(m.expires_at),
  };
}

export function computeRemaining(expires_at?: string | null): number | null {
  if (!expires_at) return null;
  const diff = new Date(expires_at).getTime() - Date.now();
  return diff > 0 ? Math.floor(diff / 1000) : 0;
}
