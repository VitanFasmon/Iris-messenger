import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<Props> = ({ onSuccess }) => {
  const { register, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await register(username, email, password);
    if (res && onSuccess) onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label="Registration form"
    >
      <div className="space-y-2">
        <label htmlFor="register-username" className="text-emerald-100 text-sm">
          Username
        </label>
        <input
          id="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded bg-gray-800/50 border border-emerald-600/30 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="your_username"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-emerald-100 text-sm">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded bg-gray-800/50 border border-emerald-600/30 px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-password" className="text-emerald-100 text-sm">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
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
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};
