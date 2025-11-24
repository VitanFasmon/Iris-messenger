import React, { useEffect, useState } from "react";
import type { Message } from "../api/messages";
import { sanitize } from "../../../lib/sanitize";
import { getFullUrl } from "../../../lib/urls";
import { MoreVertical } from "lucide-react";

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
      <div className="relative group">
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
          <div className="mt-1 px-2 flex items-center justify-end gap-2">
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

        {/* Three-dot menu for own messages */}
        {isMine &&
          onDelete &&
          !message.id.toString().startsWith("optimistic-") && (
            <div className="absolute top-2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                aria-label="Message options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-32 z-10">
                  <button
                    onClick={() => {
                      onDelete(message.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-gray-700 rounded-lg"
                  >
                    Unsend
                  </button>
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
