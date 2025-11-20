import { api } from "../../../lib/axios";
import type { AxiosResponse } from "axios";

export interface Attachment {
  id: string | number;
  file_type: string;
  file_url: string;
}

export interface Message {
  id: string | number;
  sender_id: string | number;
  receiver_id: string | number;
  content: string | null;
  file_url: string | null;
  timestamp: string; // ISO
  delete_after?: number | null;
  expires_at?: string | null;
  attachments?: Attachment[];
  // UI enrichment
  localStatus?: "sending" | "sent" | "failed";
}

// Fetch messages exchanged with given receiver (friend user id)
export async function fetchMessages(receiverId: string | number): Promise<Message[]> {
  const res: AxiosResponse<any[]> = await api.get(`/messages/${receiverId}`);
  return res.data.map(m => ({ ...m, localStatus: "sent" }));
}

export interface SendDirectMessagePayload {
  receiverId: string | number;
  content?: string;
  file?: File | null;
  delete_after?: number | null; // seconds
}

export async function sendDirectMessage(payload: SendDirectMessagePayload): Promise<Message> {
  const { receiverId, content, file, delete_after } = payload;
  if (file) {
    const form = new FormData();
    if (content) form.append("content", content);
    form.append("file", file);
    if (delete_after) form.append("delete_after", String(delete_after));
    const res: AxiosResponse<any> = await api.post(`/messages/${receiverId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ...res.data.data, localStatus: "sent" };
  }
  const body: Record<string, any> = {};
  if (content) body.content = content;
  if (delete_after) body.delete_after = delete_after;
  const res: AxiosResponse<any> = await api.post(`/messages/${receiverId}`, body);
  return { ...res.data.data, localStatus: "sent" };
}

export async function deleteMessage(messageId: string | number): Promise<{ message: string }> {
  const res: AxiosResponse<any> = await api.delete(`/messages/${messageId}`);
  return res.data;
}
