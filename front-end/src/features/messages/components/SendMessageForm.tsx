import React, { useState } from "react";
import { useSendDirectMessage } from "../hooks/useMessages";

interface Props {
  receiverId: string | number | null;
}

export const SendMessageForm: React.FC<Props> = ({ receiverId }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const send = useSendDirectMessage(receiverId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId) return;
    if (!text.trim() && !file) return;
    send.mutate({ content: text.trim() || undefined, file });
    setText("");
    setFile(null);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 p-2"
      aria-label="Send message form"
    >
      <label htmlFor="message-text" className="sr-only">
        Message text
      </label>
      <input
        id="message-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-required="false"
      />
      <label htmlFor="message-attachment" className="sr-only">
        Attach file
      </label>
      <input
        id="message-attachment"
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-xs"
        aria-label="Choose attachment file"
      />
      <button
        type="submit"
        disabled={send.isPending || !receiverId}
        aria-busy={send.isPending}
        className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {send.isPending ? "Sending..." : "Send"}
      </button>
    </form>
  );
};
