import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { ToastContainer } from "../../ui/Toast";
import { clearAccessToken, getAccessToken } from "../../lib/tokenStore";
import { MessageCircle, Settings, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSession } from "../../features/auth/hooks/useSession";
import { useQueryClient } from "@tanstack/react-query";
import { getFullUrl } from "../../lib/urls";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
          <button
            className="text-sm text-emerald-500 underline"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default function AppLayout() {
  const { toastQueue, removeToast, pushToast } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useSession();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Ignore errors - we'll clear local state regardless
      });
    } catch {
      // Ignore network errors
    }

    // Clear local token
    clearAccessToken();

    // Clear React Query cache to immediately remove user data
    queryClient.clear();

    pushToast({ type: "info", message: "Logged out successfully." });
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300">
      <div className="w-full  h-screen bg-gray-900 shadow-xl flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-emerald-900/30 bg-emerald-950/30">
          <button
            onClick={() => navigate("/app/settings")}
            className="flex items-center gap-3 group"
            aria-label="Open profile"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-emerald-500 transition">
              {user?.profile_picture_url ? (
                <img
                  src={`${getFullUrl(
                    user.profile_picture_url
                  )}?t=${Date.now()}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-300">
                  {(user?.username?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <span
              className="text-sm font-semibold text-white tracking-wide max-w-[140px] lg:max-w-[200px] truncate"
              title={user?.username || "Guest"}
            >
              {user?.username || "Guest"}
            </span>
          </button>
          <nav className="flex items-center gap-2" aria-label="Primary">
            {(() => {
              const chatActive =
                location.pathname === "/app" ||
                location.pathname.startsWith("/app/chat");
              return (
                <button
                  onClick={() => navigate("/app")}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                    chatActive
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  aria-label="Chats"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              );
            })()}
            {(() => {
              const settingsActive =
                location.pathname.startsWith("/app/settings");
              return (
                <button
                  onClick={() => navigate("/app/settings")}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                    settingsActive
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  aria-label="Settings & Profile"
                >
                  <Settings className="w-5 h-5" />
                </button>
              );
            })()}
            <div className="w-px h-6 bg-gray-700 mx-2" aria-hidden="true" />
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer
        toasts={toastQueue.map((t) => ({
          id: t.id,
          message: t.message,
          variant: t.type,
        }))}
        onDismiss={removeToast}
      />
    </div>
  );
}
