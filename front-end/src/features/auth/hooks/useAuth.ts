import { useState } from "react";
import { setAccessToken, clearAccessToken } from "../../../lib/tokenStore";
import type { AuthResponse } from "../../../types/api";
import { loginApi, registerApi, extractErrorMessage } from "../api/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(username, password);
      setAccessToken(data.access_token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(extractErrorMessage(err, "Login failed"));
      return null;
    }
  }

  async function register(username: string, email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await registerApi(username, email, password);
      setAccessToken(data.access_token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(extractErrorMessage(err, "Registration failed"));
      return null;
    }
  }

  function logout() {
    clearAccessToken();
    setUser(null);
  }

  return { user, loading, error, login, register, logout };
}
