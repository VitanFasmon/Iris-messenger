import React, { useEffect, useRef } from "react";
import { useMessages } from "../hooks/useMessages";
import { MessageBubble } from "./MessageBubble";

interface Props {
  conversationId: string | null;
}

export const MessageList: React.FC<Props> = ({ conversationId }) => {
  const { data, isLoading, error } = useMessages(conversationId);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.data.length]);

  if (!conversationId)
    return (
      <div className="p-4 text-sm text-gray-500">Select a conversation.</div>
    );
  if (isLoading)
    return <div className="p-4 text-sm text-gray-500">Loading messages...</div>;
  if (error)
    return (
      <div className="p-4 text-sm text-red-600">Failed to load messages.</div>
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-2 p-4">
      {data?.data.map((m) => (
        <MessageBubble key={m.id} message={m as any} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
