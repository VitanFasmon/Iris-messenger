import React, { useState, useEffect } from "react";
import { useSendDirectMessage } from "../hooks/useMessages";
import { Paperclip, Image as ImageIcon, Timer, Send } from "lucide-react";
import { useSession } from "../../auth/hooks/useSession";
import { useTheme } from "../../../hooks/useTheme";

interface Props {
  receiverId: string | number | null;
}

export const SendMessageForm: React.FC<Props> = ({ receiverId }) => {
  const { colors, theme } = useTheme();
  const { data: user } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [customDays, setCustomDays] = useState(0);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const send = useSendDirectMessage(receiverId, user?.id);

  useEffect(() => {
    if (!showTimer) return;
    const handleClickOutside = () => setShowTimer(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showTimer]);

  const handleSelectTimer = (seconds: number | null) => {
    setTimerSeconds(seconds);
    setShowTimer(false);
  };

  const handleCustomTimerSubmit = () => {
    const totalSeconds =
      customDays * 86400 +
      customHours * 3600 +
      customMinutes * 60 +
      customSeconds;
    if (totalSeconds > 0) {
      setTimerSeconds(totalSeconds);
    }
    setShowCustomTimer(false);
    setShowTimer(false);
  };

  const formatTimerDisplay = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
    return `${Math.round(seconds / 86400)}d`;
  };

  const calculateDeletionTime = (): string => {
    const totalSeconds =
      customDays * 86400 +
      customHours * 3600 +
      customMinutes * 60 +
      customSeconds;
    if (totalSeconds === 0) return "No time set";
    const deletionDate = new Date(Date.now() + totalSeconds * 1000);
    const day = String(deletionDate.getDate()).padStart(2, "0");
    const month = String(deletionDate.getMonth() + 1).padStart(2, "0");
    const year = deletionDate.getFullYear();
    const time = deletionDate.toLocaleTimeString();
    return `${day}/${month}/${year}, ${time}`;
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId) return;
    if (!text.trim() && !file) return;
    send.mutate({
      content: text.trim() || undefined,
      file,
      delete_after: timerSeconds,
    });
    setText("");
    setFile(null);
    setFilePreview(null);
    setTimerSeconds(null);
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className={`flex flex-col gap-2 p-3 lg:p-4 ${colors.form.bg} backdrop-blur border-t ${colors.border.primary}`}
        aria-label="Send message form"
      >
        {filePreview && (
          <div className="relative inline-block max-w-xs">
            <img
              src={filePreview}
              alt="Preview"
              className={`rounded-lg max-h-32 object-cover border ${colors.border.secondary}`}
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
            <p className={`text-xs ${colors.text.tertiary} mt-1 truncate`}>
              {file?.name}
            </p>
          </div>
        )}
        {/* Non-image file indicator */}
        {file && !filePreview && (
          <div
            className={`flex items-center gap-2 ${colors.card.bg} border ${colors.border.secondary} rounded-lg p-2 max-w-xs`}
          >
            <Paperclip className={`w-4 h-4 ${colors.text.tertiary}`} />
            <span
              className={`text-xs ${colors.text.secondary} truncate flex-1`}
            >
              {file.name}
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <label
              className={`w-9 h-9 flex items-center justify-center rounded-full ${colors.bg.hover} cursor-pointer ${colors.text.tertiary} hover:text-emerald-400`}
              title="Attach file"
            >
              <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Paperclip className="w-4 h-4" />
            </label>
            <label
              className={`w-9 h-9 flex items-center justify-center rounded-full ${colors.bg.hover} cursor-pointer ${colors.text.tertiary} hover:text-emerald-400`}
              title="Attach image"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />
              <ImageIcon className="w-4 h-4" />
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimer((s) => !s);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition ${
                  timerSeconds
                    ? theme === "light"
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-emerald-600 text-gray-900 hover:bg-emerald-500"
                    : `${colors.bg.hover} ${colors.text.tertiary} hover:text-emerald-400`
                }`}
                aria-haspopup="listbox"
                aria-expanded={showTimer}
                title={
                  timerSeconds
                    ? `Auto-delete in ${formatTimerDisplay(timerSeconds)}`
                    : "Self-destruct timer"
                }
              >
                <Timer className="w-4 h-4" />
              </button>
              {showTimer && (
                <ul
                  className={`absolute bottom-12 left-0 ${colors.card.bg} border ${colors.border.secondary} rounded-lg shadow-xl text-xs ${colors.text.secondary} w-36 overflow-hidden`}
                  role="listbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[null, 30, 300, 1800, 7200, 86400, 172800].map((s) => {
                    const label = (() => {
                      if (s === null) return "No timer";
                      if (s < 60) return `${s}s`;
                      if (s < 3600) return `${Math.round(s / 60)}m`;
                      if (s < 86400) return `${Math.round(s / 3600)}h`;
                      return `${Math.round(s / 86400)}d`;
                    })();
                    return (
                      <li key={String(s)}>
                        <button
                          type="button"
                          onClick={() => handleSelectTimer(s)}
                          className={`w-full text-left px-3 py-2 ${
                            theme === "light"
                              ? "hover:bg-gray-200"
                              : colors.bg.hover
                          } ${
                            timerSeconds === s
                              ? theme === "light"
                                ? "bg-gray-300"
                                : "bg-gray-700"
                              : ""
                          }`}
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
                  <li className={`border-t ${colors.border.secondary}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomTimer(true);
                        setShowTimer(false);
                      }}
                      className={`w-full text-left px-3 py-2 ${
                        theme === "light"
                          ? "hover:bg-gray-200"
                          : colors.bg.hover
                      } text-emerald-400 font-medium`}
                    >
                      Custom...
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[200px] flex items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message"
              className={`flex-1 rounded-full ${colors.input.bg} border ${colors.input.border} ${colors.input.text} ${colors.input.placeholder} px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          <button
            type="submit"
            disabled={send.isPending}
            className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${
              theme === "light"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-gray-900"
            } disabled:opacity-50`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Custom Timer Modal - Rendered outside form */}
      {showCustomTimer && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          style={{ position: "fixed", inset: 0 }}
        >
          <div
            className={`w-full max-w-md ${colors.bg.primary} border ${colors.border.primary} rounded-xl shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${colors.border.primary}`}
            >
              <h2 className={`text-base ${colors.text.primary} font-semibold`}>
                Custom Timer
              </h2>
              <button
                onClick={() => setShowCustomTimer(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                  theme === "light"
                    ? `${colors.text.tertiary} hover:bg-gray-200`
                    : `${colors.text.tertiary} hover:text-white ${colors.bg.hover}`
                }`}
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`${colors.text.secondary} text-xs block mb-2`}
                  >
                    Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={customDays}
                    onChange={(e) =>
                      setCustomDays(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className={`w-full rounded-lg ${colors.input.bg} border ${colors.input.border} ${colors.input.text} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
                <div>
                  <label
                    className={`${colors.text.secondary} text-xs block mb-2`}
                  >
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={customHours}
                    onChange={(e) =>
                      setCustomHours(
                        Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                      )
                    }
                    className={`w-full rounded-lg ${colors.input.bg} border ${colors.input.border} ${colors.input.text} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
                <div>
                  <label
                    className={`${colors.text.secondary} text-xs block mb-2`}
                  >
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) =>
                      setCustomMinutes(
                        Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                      )
                    }
                    className={`w-full rounded-lg ${colors.input.bg} border ${colors.input.border} ${colors.input.text} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
                <div>
                  <label
                    className={`${colors.text.secondary} text-xs block mb-2`}
                  >
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) =>
                      setCustomSeconds(
                        Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                      )
                    }
                    className={`w-full rounded-lg ${colors.input.bg} border ${colors.input.border} ${colors.input.text} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              <div
                className={`${colors.bg.secondary} border ${colors.border.secondary} rounded-lg p-3`}
              >
                <p className={`text-xs ${colors.text.tertiary} mb-1`}>
                  Estimated deletion time:
                </p>
                <p className={`text-sm ${colors.text.primary} font-medium`}>
                  {calculateDeletionTime()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCustomTimerSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg py-2 transition"
                >
                  Set Timer
                </button>
                <button
                  onClick={() => setShowCustomTimer(false)}
                  className={`flex-1 border ${colors.border.secondary} ${colors.text.secondary} ${colors.card.hover} text-sm rounded-lg py-2 transition`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
