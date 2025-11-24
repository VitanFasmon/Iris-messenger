import React, { useState } from "react";
import { useSendDirectMessage } from "../hooks/useMessages";
import {
  Paperclip,
  Image as ImageIcon,
  Timer,
  Send,
  Smile,
} from "lucide-react";

interface Props {
  receiverId: string | number | null;
}

export const SendMessageForm: React.FC<Props> = ({ receiverId }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const send = useSendDirectMessage(receiverId);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSelectTimer = (seconds: number | null) => {
    setTimerSeconds(seconds);
    setShowTimer(false);
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
    setTimerSeconds(null);
    setShowEmoji(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 p-3 bg-gray-950/90 backdrop-blur border-t border-gray-800"
      aria-label="Send message form"
    >
      {/* Toolbar icons */}
      <div className="flex items-center gap-2">
        <label className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-emerald-400">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <Paperclip className="w-4 h-4" />
        </label>
        <label className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-emerald-400">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <ImageIcon className="w-4 h-4" />
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimer((s) => !s)}
            className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-emerald-400 ${
              timerSeconds ? "bg-emerald-600/20" : ""
            }`}
            aria-haspopup="listbox"
            aria-expanded={showTimer}
            aria-label="Self-destruct timer"
          >
            <Timer className="w-4 h-4" />
          </button>
          {showTimer && (
            <ul
              className="absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300 w-32 overflow-hidden"
              role="listbox"
            >
              {[null, 10, 30, 60, 300].map((s) => (
                <li key={String(s)}>
                  <button
                    type="button"
                    onClick={() => handleSelectTimer(s)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 ${
                      timerSeconds === s ? "bg-gray-700" : ""
                    }`}
                  >
                    {s === null ? "No timer" : `${s}s`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Emoji picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((e) => !e)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-emerald-400"
            aria-haspopup="dialog"
            aria-expanded={showEmoji}
            aria-label="Emoji picker"
          >
            <Smile className="w-4 h-4" />
          </button>
          {showEmoji && (
            <div
              className="absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-2 w-56 grid grid-cols-8 gap-1 text-xl"
              role="dialog"
              aria-label="Emoji picker"
            >
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className="hover:bg-gray-700 rounded"
                  onClick={() => setText((t) => t + em)}
                  aria-label={`Insert ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Input pill */}
      <div className="flex-1 flex items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
          className="flex-1 rounded-full bg-gray-800/70 border border-gray-700 text-white placeholder:text-gray-500 px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      {/* Active timer banner */}
      {timerSeconds && (
        <div className="hidden md:flex items-center text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-600/15 border border-emerald-700 text-emerald-300">
          Auto-delete: {timerSeconds}s
        </div>
      )}
      <button
        type="submit"
        disabled={send.isPending}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-gray-900 disabled:opacity-50"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

// Lightweight emoji set (can be swapped for full picker library later)
const EMOJIS = [
  "😀",
  "😅",
  "😂",
  "😊",
  "😍",
  "😎",
  "🤔",
  "😴",
  "😢",
  "😭",
  "😡",
  "👍",
  "👎",
  "🙏",
  "🔥",
  "💯",
  "✨",
  "🎉",
  "❤️",
  "💔",
  "😇",
  "🤖",
  "🧠",
  "📌",
];
