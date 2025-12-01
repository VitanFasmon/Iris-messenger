import AppRouter from "./app/router";
import React, { useEffect } from "react";
import { useUiStore } from "./store/uiStore";
import { ToastContainer } from "./ui/Toast";

// Runs startup environment checks (missing vars, host mismatch) and surfaces them via console + toast.
const StartupChecks: React.FC = () => {
  const { pushToast, toastQueue, removeToast } = useUiStore();
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL;
    if (!apiBase) {
      console.warn(
        "[StartupChecks] VITE_API_URL is missing; API calls will hit the frontend dev server."
      );
      pushToast({
        type: "error",
        message: "VITE_API_URL missing. Set it in .env.",
      });
      return;
    }
    // Warn if API host equals current origin (likely misconfigured backend port)
    try {
      const apiUrl = new URL(apiBase);
      const sameOrigin = apiUrl.origin === window.location.origin;
      if (sameOrigin) {
        console.warn(
          `[StartupChecks] VITE_API_URL (${apiUrl.origin}) matches frontend origin; ensure backend is on another port or enable proxy.`
        );
      }
    } catch (e) {
      console.warn("[StartupChecks] Invalid VITE_API_URL format", e);
      pushToast({ type: "error", message: "Invalid VITE_API_URL format." });
    }
  }, [pushToast]);

  return (
    <>
      {/* Global toast container - shows on all pages */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none"
      >
        <ToastContainer
          toasts={toastQueue.map((t) => ({
            id: t.id,
            message: t.message,
            variant: t.type,
          }))}
          onDismiss={removeToast}
        />
      </div>
    </>
  );
};

export default function App() {
  return (
    <>
      <StartupChecks />
      <AppRouter />
    </>
  );
}
