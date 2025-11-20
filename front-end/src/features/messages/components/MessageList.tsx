import React, { useEffect, useRef } from "react";
import { useDirectMessages } from "../hooks/useMessages";
import { MessageBubble } from "./MessageBubble";

interface Props {
  receiverId: string | number | null;
}

export const MessageList: React.FC<Props> = ({ receiverId }) => {
  const { data, isLoading, error } = useDirectMessages(receiverId);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.length]);

  if (!receiverId)
    return (
      <div className="p-4 text-sm text-gray-500">
        Select a friend to start chatting.
      </div>
    );
  if (isLoading)
    return <div className="p-4 text-sm text-gray-500">Loading messages...</div>;
  if (error)
    return (
      <div className="p-4 text-sm text-red-600">Failed to load messages.</div>
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-2 p-4">
      {data?.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
