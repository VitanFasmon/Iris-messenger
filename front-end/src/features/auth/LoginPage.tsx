import { useAuth } from "./hooks/useAuth";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(username, password);
    if (res) navigate("/app");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-linear-to-br from-emerald-900 via-teal-900 to-emerald-950 p-8">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-4">
            <MessageCircle className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="text-white text-2xl font-semibold">Messenger</h1>
          <p className="text-emerald-200 text-sm mt-2">Sign in to continue</p>
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Login form"
        >
          <div className="space-y-2">
            <label
              htmlFor="login-username"
              className="text-emerald-100 text-sm"
            >
              Username
            </label>
            <input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded bg-gray-800/50 border border-emerald-600/30 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="your_username"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="text-emerald-100 text-sm"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded bg-gray-800/50 border border-emerald-600/30 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded bg-emerald-500 hover:bg-emerald-400 text-gray-900 py-2 text-sm font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <span className="text-emerald-100 text-sm">
            Don't have an account?
            <Link
              to="/register"
              className="text-emerald-100 underline hover:text-emerald-300 ml-2"
            >
              Create one
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
