import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await login(username, password);
    if (res && onSuccess) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Login form">
      <div>
        <label
          htmlFor="login-username"
          className="block text-sm font-medium mb-1"
        >
          Username
        </label>
        <input
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="your_username"
        />
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="block text-sm font-medium mb-1"
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
          className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full rounded bg-indigo-600 hover:bg-indigo-500 text-white py-2 text-sm font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
