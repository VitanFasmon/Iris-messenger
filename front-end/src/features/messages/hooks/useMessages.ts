import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  deleteMessage,
  type Conversation,
  type Message,
  type SendMessagePayload,
} from "../api/messages";

const CONVERSATIONS_KEY = ["conversations"];
const MESSAGES_KEY = (conversationId: string) => ["messages", conversationId];

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: CONVERSATIONS_KEY,
    queryFn: fetchConversations,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery<{ data: Message[] }>({
    enabled: !!conversationId,
    queryKey: MESSAGES_KEY(conversationId || ""),
    queryFn: async () => {
      const page = await fetchMessages(conversationId!);
      return { data: page.data };
    },
    staleTime: 5_000,
  });
}

export function useSendMessage(conversationId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<SendMessagePayload, "conversationId">) =>
      sendMessage({ conversationId: conversationId!, ...payload }),
    onMutate: async (variables) => {
      if (!conversationId) return;
      await qc.cancelQueries({ queryKey: MESSAGES_KEY(conversationId) });
      const prev = qc.getQueryData<{ data: Message[] }>(
        MESSAGES_KEY(conversationId)
      );
      if (prev) {
        const optimistic: Message = {
          id: "optimistic-" + Date.now(),
          conversation_id: conversationId,
          sender_id: "me", // replace with actual user id from auth later
          content: variables.content,
          created_at: new Date().toISOString(),
          deleted_at: null,
          attachment_url: null,
        };
        qc.setQueryData(MESSAGES_KEY(conversationId), {
          data: [...prev.data, optimistic],
        });
      }
      return { prev }; // context
    },
    onError: (_err, _vars, ctx) => {
      if (conversationId && ctx?.prev) {
        qc.setQueryData(MESSAGES_KEY(conversationId), ctx.prev);
      }
    },
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({ queryKey: MESSAGES_KEY(conversationId) });
        qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      }
    },
  });
}

export function useDeleteMessage(conversationId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) =>
      deleteMessage(conversationId!, messageId),
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({ queryKey: MESSAGES_KEY(conversationId) });
      }
    },
  });
}
