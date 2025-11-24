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
  // Backend may return either `access_token` or `token`
  access_token?: string;
  token?: string;
  refresh_token?: string | null;
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

// Pagination type for paginated API responses
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

// (Deprecated types and mapping utilities removed)
