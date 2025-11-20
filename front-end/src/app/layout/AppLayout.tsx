import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { ToastContainer } from "../../ui/Toast";
import { clearAccessToken } from "../../lib/tokenStore";

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
            className="text-sm text-blue-600 underline"
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

  const handleLogout = () => {
    clearAccessToken();
    pushToast({ type: "info", message: "Logged out successfully." });
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 flex flex-col gap-2"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="px-2 py-3">
          <h1 className="text-lg font-semibold text-sidebar-primary">
            Iris Messenger
          </h1>
        </div>
        <nav className="flex-1">
          <ul role="list" className="flex flex-col gap-1">
            <li>
              <Link
                to="/app"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                Chats
              </Link>
            </li>
            <li>
              <Link
                to="/app/friends"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                Friends
              </Link>
            </li>
            <li>
              <Link
                to="/app/settings"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>
        <div className="border-t border-sidebar-border pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
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
