import React, { useEffect } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  variant?: "info" | "success" | "error";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  duration?: number; // ms
}

export const ToastContainer: React.FC<ToastProps> = ({
  toasts,
  onDismiss,
  duration = 4000,
}) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => onDismiss(t.id), duration)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss, duration]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded shadow px-3 py-2 text-sm bg-white dark:bg-gray-900 border flex justify-between items-start gap-2 ${
            t.variant === "success"
              ? "border-green-500"
              : t.variant === "error"
              ? "border-red-500"
              : "border-gray-300"
          }`}
        >
          <span className="flex-1 wrap-break-word">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-xs text-gray-500 hover:text-gray-700"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
