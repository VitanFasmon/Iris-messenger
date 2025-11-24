import React, { useEffect, useState } from "react";
import type { Message } from "../api/messages";
import { sanitize } from "../../../lib/sanitize";

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

  // Expiry countdown -------------------------------------------------------
  const [remaining, setRemaining] = useState<number | null>(() => {
    const expiry = deriveExpiry(message);
    if (!expiry) return null;
    return expiry.getTime() - Date.now();
  });

  useEffect(() => {
    const expiry = deriveExpiry(message);
    if (!expiry) return;
    const tick = () => {
      const ms = expiry.getTime() - Date.now();
      setRemaining(ms > 0 ? ms : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [message.id, message.timestamp, message.delete_after, message.expires_at]);

  const expired = remaining !== null && remaining <= 0;

  function formatRemaining(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // If expired locally, don't render (MessageList will refetch periodically or next activity)
  if (expired) return null;

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
        <p className="whitespace-pre-wrap wrap-break-word">
          {sanitize(message.content)}
        </p>
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
        {remaining !== null && remaining > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900/40 text-emerald-300 border border-gray-700">
            {formatRemaining(remaining)}
          </span>
        )}
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

// Derive expiry Date from message fields
function deriveExpiry(message: Message): Date | null {
  if (message.expires_at) {
    const d = new Date(message.expires_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (message.delete_after) {
    const base = new Date(message.timestamp);
    if (!isNaN(base.getTime())) {
      return new Date(base.getTime() + message.delete_after * 1000);
    }
  }
  return null;
}
