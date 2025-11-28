import React, { useEffect, useState } from "react";
import type { Message } from "../api/messages";
import { sanitize } from "../../../lib/sanitize";
import { getFullUrl } from "../../../lib/urls";

interface Props {
  message: Message;
  isMine: boolean;
  onDelete?: (messageId: string | number) => void;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isMine,
  onDelete,
}) => {
  const status = message.localStatus;
  const timeLabel = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fullFileUrl = getFullUrl(message.file_url);
  const isImage =
    !!fullFileUrl &&
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fullFileUrl.split("?")[0]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

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
    <>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={
            "rounded-2xl px-4 py-2 text-sm " +
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
          {fullFileUrl &&
            (isImage ? (
              <div className="mt-2">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="group block"
                >
                  <img
                    src={fullFileUrl}
                    alt="attachment preview"
                    loading="lazy"
                    className="rounded-xl max-h-64 object-cover border border-gray-700 group-hover:opacity-90 transition cursor-pointer"
                  />
                </button>
              </div>
            ) : (
              <a
                href={fullFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-emerald-300 mt-1 truncate underline"
              >
                Attachment
              </a>
            ))}
          <div className="mt-1 px-2 flex items-center gap-2">
            <span className="text-xs text-gray-300">{timeLabel}</span>
            {remaining !== null && remaining > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900/40 text-emerald-300 border border-gray-700">
                {formatRemaining(remaining)}
              </span>
            )}
            {status === "sending" && (
              <span className="text-xs text-gray-400 animate-pulse">
                sending…
              </span>
            )}
            {status === "failed" && (
              <span className="text-xs text-red-400">failed</span>
            )}
          </div>
        </div>

        {/* Unsend button below message */}
        {isMine &&
          onDelete &&
          !message.id.toString().startsWith("optimistic-") && (
            <div className="relative self-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
              >
                Unsend
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-40 z-10 p-2">
                  <p className="text-xs text-gray-400 mb-2">
                    Delete this message?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                      className="flex-1 px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(message.id);
                        setShowMenu(false);
                      }}
                      className="flex-1 px-2 py-1 text-xs text-red-300 hover:bg-red-900/30 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Image enlargement modal */}
      {showImageModal && fullFileUrl && isImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={fullFileUrl}
              alt="Full size attachment"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900/80 hover:bg-gray-800 text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
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
