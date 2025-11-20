import React from "react";
import type { Message } from "../api/messages";

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const status = message.localStatus;
  const timeLabel = new Date(message.timestamp).toLocaleTimeString();
  return (
    <div
      className={
        "max-w-[70%] rounded px-3 py-2 text-sm shadow relative " +
        (status === "failed"
          ? "bg-red-100 dark:bg-red-900/30 border border-red-400"
          : status === "sending"
          ? "bg-indigo-50 dark:bg-indigo-900/30"
          : "bg-white dark:bg-gray-800")
      }
    >
      {message.content && (
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      )}
      {message.file_url && (
        <a
          href={message.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-indigo-600 mt-1 truncate"
        >
          Attachment
        </a>
      )}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">{timeLabel}</span>
        {status === "sending" && (
          <span className="text-[10px] text-indigo-500 animate-pulse">
            sending…
          </span>
        )}
        {status === "failed" && (
          <span className="text-[10px] text-red-600">failed</span>
        )}
      </div>
    </div>
  );
};
