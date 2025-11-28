import React, { useState, useEffect } from "react";
import { useSendDirectMessage } from "../hooks/useMessages";
import { Paperclip, Image as ImageIcon, Timer, Send } from "lucide-react";
import { useSession } from "../../auth/hooks/useSession";

interface Props {
  receiverId: string | number | null;
}

export const SendMessageForm: React.FC<Props> = ({ receiverId }) => {
  const { data: user } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const send = useSendDirectMessage(receiverId, user?.id);

  // Close timer menu when clicking outside
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

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
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
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 p-3 lg:p-4 bg-emerald-950/30 backdrop-blur border-t border-gray-800"
      aria-label="Send message form"
    >
      {/* Image Preview */}
      {filePreview && (
        <div className="relative inline-block max-w-xs">
          <img
            src={filePreview}
            alt="Preview"
            className="rounded-lg max-h-32 object-cover border border-gray-700"
          />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
          <p className="text-xs text-gray-400 mt-1 truncate">{file?.name}</p>
        </div>
      )}
      {/* Non-image file indicator */}
      {file && !filePreview && (
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-2 max-w-xs">
          <Paperclip className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-300 truncate flex-1">
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

      <div className="flex items-center gap-2">
        {/* Toolbar icons */}
        <div className="flex items-center gap-2">
          <label
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-emerald-400"
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
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-emerald-400"
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
              className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-emerald-400 ${
                timerSeconds ? "bg-emerald-600/20" : ""
              }`}
              aria-haspopup="listbox"
              aria-expanded={showTimer}
              title="Self-destruct timer"
            >
              <Timer className="w-4 h-4" />
            </button>
            {showTimer && (
              <ul
                className="absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300 w-32 overflow-hidden"
                role="listbox"
                onClick={(e) => e.stopPropagation()}
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
        <button
          type="submit"
          disabled={send.isPending}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-gray-900 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
