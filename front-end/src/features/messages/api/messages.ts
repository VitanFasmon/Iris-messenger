import { api } from "../../../lib/axios";
import type { AxiosResponse } from "axios";
import { sanitize } from "../../../lib/sanitize";

export interface Conversation {
  id: string;
  title?: string | null;
  participant_ids: string[]; // excluding current user? backend clarifies
  updated_at: string;
  last_message_preview?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_username?: string;
  content: string;
  created_at: string;
  attachment_url?: string | null;
  deleted_at?: string | null;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachment?: File | null;
}

interface Paginated<T> {
  data: T[];
  meta?: { page?: number; per_page?: number; total?: number };
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res: AxiosResponse<Conversation[]> = await api.get("/conversations");
  return res.data;
}

export async function fetchMessages(
  conversationId: string,
  page: number = 1
): Promise<Paginated<Message>> {
  const res: AxiosResponse<Paginated<Message>> = await api.get(
    `/conversations/${conversationId}/messages`,
    { params: { page } }
  );
  return res.data;
}

export async function sendMessage(
  payload: SendMessagePayload
): Promise<Message> {
  if (payload.attachment) {
    const form = new FormData();
    form.append("content", sanitize(payload.content));
    form.append("attachment", payload.attachment);
    const res: AxiosResponse<Message> = await api.post(
      `/conversations/${payload.conversationId}/messages`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  } else {
    const res: AxiosResponse<Message> = await api.post(
      `/conversations/${payload.conversationId}/messages`,
      {
        content: sanitize(payload.content),
      }
    );
    return res.data;
  }
}

export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<{ success: boolean }> {
  const res: AxiosResponse<{ success: boolean }> = await api.delete(
    `/conversations/${conversationId}/messages/${messageId}`
  );
  return res.data;
}
