import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markMessagesAsRead, type MarkAsReadPayload } from "../api/messages";

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkAsReadPayload) => markMessagesAsRead(payload),
    onSuccess: () => {
      // Invalidate and refetch unread counts immediately to refresh badges
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
      queryClient.refetchQueries({ queryKey: ["unread-counts"] });
    },
  });
}
