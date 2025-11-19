import React from "react";
import type { Message } from "../../../types/api";
import { useCountdown } from "../../../hooks/useCountdown";

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const remaining = useCountdown(message.remainingSeconds ?? null);
  const isExpiring = (message.remainingSeconds ?? 0) > 0;
  const status = message.localStatus;

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
      <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {new Date(message.sent_at).toLocaleTimeString()}
        </span>
        {status === "sending" && (
          <span className="text-[10px] text-indigo-500 animate-pulse">
            sending…
          </span>
        )}
        {status === "failed" && (
          <span className="text-[10px] text-red-600">failed</span>
        )}
        {isExpiring && remaining !== null && (
          <span className="text-[10px] text-orange-600">{remaining}s</span>
        )}
      </div>
    </div>
  );
};
