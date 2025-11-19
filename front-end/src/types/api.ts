// Domain models and API response types for Iris Messenger
// See FRONT_END_PLAN.md for backend field mapping and usage notes

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  last_online: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Friend {
  id: number;
  username: string;
  avatar_url: string | null;
  last_online: string;
}

export interface FriendRequest {
  id: number;
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  conversation_id: number;
  content: string;
  attachment_url: string | null;
  sent_at: string;
  deleted_at?: string | null;
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message: Message | null;
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
