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

// Deprecated legacy conversation-based message types removed. Use Message from messages/api/messages.ts
// Keeping minimal placeholder exports to avoid breaking unused imports; will be removed once refactors complete.
export interface MessageApiDeprecated {
  id: number;
}
export interface MessageDeprecated extends MessageApiDeprecated {}

// Legacy conversation model removed (backend does not provide conversation abstraction)
export interface ConversationDeprecated {
  id: number;
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
// No-op utilities retained for backwards compatibility; to delete after full migration.
export function mapMessageApiToMessage(_m: any): any {
  return _m;
}
export function computeRemaining(_expires_at?: string | null): number | null {
  return null;
}
