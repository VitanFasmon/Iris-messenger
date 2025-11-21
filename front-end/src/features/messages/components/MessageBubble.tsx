import React from "react";
import type { Message } from "../api/messages";

interface Props {
  message: Message;
  isMine: boolean;
}

export const MessageBubble: React.FC<Props> = ({ message, isMine }) => {
  const status = message.localStatus;
  const timeLabel = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isImage =
    !!message.file_url &&
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(message.file_url.split("?")[0]);

  return (
    <div
      className={
        "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
        (status === "failed"
          ? "bg-red-600/20 border border-red-500 text-white"
          : isMine
          ? "bg-emerald-600 text-white rounded-br-sm"
          : "bg-gray-800 border border-gray-700 text-white rounded-bl-sm")
      }
    >
      {message.content && (
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
      )}
      {message.file_url &&
        (isImage ? (
          <div className="mt-2">
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <img
                src={message.file_url}
                alt="attachment preview"
                loading="lazy"
                className="rounded-xl max-h-64 object-cover border border-gray-700 group-hover:opacity-90 transition"
              />
            </a>
          </div>
        ) : (
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-emerald-300 mt-1 truncate underline"
          >
            Attachment
          </a>
        ))}
      <div className="mt-1 px-2 flex items-center justify-end gap-2">
        <span className="text-xs text-gray-300">{timeLabel}</span>
        {status === "sending" && (
          <span className="text-xs text-gray-400 animate-pulse">sending…</span>
        )}
        {status === "failed" && (
          <span className="text-xs text-red-400">failed</span>
        )}
      </div>
    </div>
  );
};
