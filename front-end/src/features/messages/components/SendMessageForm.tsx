import React, { useState } from "react";
import { useSendMessage } from "../hooks/useMessages";

interface Props {
  conversationId: string | null;
}

export const SendMessageForm: React.FC<Props> = ({ conversationId }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const send = useSendMessage(conversationId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    send.mutate({ content: text, attachment: file || undefined });
    setText("");
    setFile(null);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 p-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-xs"
      />
      <button
        type="submit"
        disabled={send.isPending || !conversationId}
        className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-50"
      >
        {send.isPending ? "Sending..." : "Send"}
      </button>
    </form>
  );
};
