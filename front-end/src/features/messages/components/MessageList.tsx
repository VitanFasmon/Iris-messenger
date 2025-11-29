import React, { useEffect, useMemo, useRef } from "react";
import {
  useInfiniteDirectMessages,
  useDeleteDirectMessage,
} from "../hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import { useSession } from "../../auth/hooks/useSession";
import { useTheme } from "../../../hooks/useTheme";

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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(() => {
    const pagesData = data?.pages || [];
    return pagesData.flat();
  }, [data]);

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
