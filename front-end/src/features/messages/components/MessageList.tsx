import React, { useEffect, useMemo, useRef } from "react";
import {
  useInfiniteDirectMessages,
  useDeleteDirectMessage,
} from "../hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import { useSession } from "../../auth/hooks/useSession";
import { useTheme } from "../../../hooks/useTheme";
import { useMarkAsRead } from "../hooks/useMarkAsRead";

interface Props {
  receiverId: string | number | null;
}

export const MessageList: React.FC<Props> = ({ receiverId }) => {
  const { colors } = useTheme();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteDirectMessages(receiverId, 30);
  const { data: user } = useSession();
  const deleteMessage = useDeleteDirectMessage(receiverId);
  const markAsRead = useMarkAsRead();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const markedMessagesRef = useRef<Set<string | number>>(new Set());

  const messages = useMemo(() => {
    const pagesData = data?.pages || [];
    return pagesData.flat();
  }, [data]);

  // Clear marked messages when switching conversations
  useEffect(() => {
    markedMessagesRef.current.clear();
  }, [receiverId]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (!user || !receiverId || messages.length === 0) return;
    if (markAsRead.isPending) return; // avoid overlapping mark-read calls

    // Find all messages where the current user is the receiver that haven't been marked yet
    const unreadMessageIds = messages
      .filter(
        (m) => m.receiver_id === user.id && !markedMessagesRef.current.has(m.id)
      )
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      markAsRead.mutate({ message_ids: unreadMessageIds });
      // Track that we've marked these messages
      unreadMessageIds.forEach((id) => markedMessagesRef.current.add(id));
    }
  }, [messages, user, receiverId, markAsRead.isPending]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!receiverId)
    return (
      <div className={`p-4 text-sm ${colors.text.muted}`}>
        Select a friend to start chatting.
      </div>
    );
  if (isLoading)
    return (
      <div className={`p-4 text-sm ${colors.text.muted}`}>
        Loading messages...
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-sm text-red-600">Failed to load messages.</div>
    );

  const handleDelete = (messageId: string | number) => {
    deleteMessage.mutate(messageId);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-2 p-4 lg:p-6">
      <div ref={topRef} />
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className={`text-xs px-3 py-1 rounded ${colors.bg.hover} ${colors.text.secondary} border ${colors.border.secondary}`}
          >
            {isFetchingNextPage ? "Loading…" : "Load older"}
          </button>
        </div>
      )}
      {messages.map((m) => {
        const isMine = m.sender_id === user?.id;
        return (
          <div
            key={m.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <MessageBubble
              message={m}
              isMine={isMine}
              onDelete={handleDelete}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
