import React, { useEffect, useRef } from "react";
import { useMessages } from "../hooks/useMessages";

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
        <div
          key={m.id}
          className="max-w-[70%] rounded px-3 py-2 text-sm shadow bg-white dark:bg-gray-800"
        >
          <p className="whitespace-pre-wrap wrap-break-word">{m.content}</p>
          <p className="mt-1 text-[10px] text-gray-400">
            {new Date(m.created_at).toLocaleTimeString()}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
