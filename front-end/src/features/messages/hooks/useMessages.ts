import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import {
  fetchMessages,
  fetchMessagesPage,
  sendDirectMessage,
  deleteMessage,
  type Message,
} from "../api/messages";

const MESSAGES_KEY = (receiverId: string | number) =>
  queryKeys.directMessages(receiverId);

export function useDirectMessages(receiverId: string | number | null) {
  return useQuery<Message[]>({
    enabled: receiverId != null,
    queryKey:
      receiverId != null
        ? MESSAGES_KEY(receiverId)
        : ["directMessages", "none"],
    queryFn: () => fetchMessages(receiverId!, { limit: 50 }),
    staleTime: 5_000,
  });
}

const INFINITE_MESSAGES_KEY = (receiverId: string | number) =>
  queryKeys.directMessagesInfinite(receiverId);

export function useInfiniteDirectMessages(
  receiverId: string | number | null,
  pageSize: number = 30
) {
  return useInfiniteQuery<Message[]>({
    enabled: receiverId != null,
    queryKey:
      receiverId != null
        ? INFINITE_MESSAGES_KEY(receiverId)
        : ["directMessagesInfinite", "none"],
    queryFn: ({ pageParam }) =>
      fetchMessagesPage(receiverId!, pageParam as string | undefined, pageSize),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      // Pages are returned ascending; oldest is index 0
      const oldest = lastPage[0];
      // Heuristic: if we got a full page, assume there may be more
      return lastPage.length >= pageSize ? oldest.timestamp : undefined;
    },
  });
}

export function useSendDirectMessage(
  receiverId: string | number | null,
  currentUserId?: string | number
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      content?: string;
      file?: File | null;
      delete_after?: number | null;
    }) => sendDirectMessage({ receiverId: receiverId!, ...payload }),
    onMutate: async (vars) => {
      if (receiverId == null) return;
      await qc.cancelQueries({ queryKey: MESSAGES_KEY(receiverId) });
      const prev = qc.getQueryData<Message[]>(MESSAGES_KEY(receiverId));
      if (prev) {
        const optimistic: Message = {
          id: "optimistic-" + Date.now(),
          sender_id: currentUserId || "me",
          receiver_id: receiverId!,
          content: vars.content || null,
          file_url: null,
          timestamp: new Date().toISOString(),
          delete_after: vars.delete_after ?? null,
          expires_at: null,
          attachments: [],
          localStatus: "sending",
        };
        qc.setQueryData<Message[]>(MESSAGES_KEY(receiverId), [
          ...prev,
          optimistic,
        ]);
      }
      return { prev, receiverId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.receiverId && ctx.prev) {
        qc.setQueryData(MESSAGES_KEY(ctx.receiverId), ctx.prev);
      }
    },
    onSuccess: () => {
      if (receiverId != null) {
        qc.invalidateQueries({ queryKey: MESSAGES_KEY(receiverId) });
        qc.invalidateQueries({ queryKey: INFINITE_MESSAGES_KEY(receiverId) });
      }
    },
  });
}

export function useDeleteDirectMessage(receiverId: string | number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string | number) => deleteMessage(messageId),
    onSuccess: () => {
      if (receiverId != null) {
        qc.invalidateQueries({ queryKey: MESSAGES_KEY(receiverId) });
        qc.invalidateQueries({ queryKey: INFINITE_MESSAGES_KEY(receiverId) });
      }
    },
  });
}
