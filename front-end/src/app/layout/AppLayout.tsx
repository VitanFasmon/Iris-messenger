import React from "react";
import { Outlet } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { ToastContainer } from "../../ui/Toast";

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
  const { toastQueue, removeToast } = useUiStore();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <nav>
          <ul>
            <li>
              <a href="/app" className="block py-2">
                Chats
              </a>
            </li>
            <li>
              <a href="/app/friends" className="block py-2">
                Friends
              </a>
            </li>
            <li>
              <a href="/app/settings" className="block py-2">
                Settings
              </a>
            </li>
            <li>
              <a href="/app/profile" className="block py-2">
                Profile
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">
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
