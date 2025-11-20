import { useState } from "react";
import { useUiStore } from "../../../store/uiStore";
import { setAccessToken, clearAccessToken } from "../../../lib/tokenStore";
import type { AuthResponse } from "../../../types/api";
import { loginApi, registerApi, extractErrorMessage } from "../api/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useUiStore();

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(username, password);
      const token = (data as any).access_token ?? (data as any).token;
      if (token) {
        setAccessToken(token);
      }
      setUser(data.user);
      setLoading(false);
      pushToast({ type: "success", message: "Logged in successfully." });
      return data;
    } catch (err) {
      setLoading(false);
      const msg = extractErrorMessage(err, "Login failed");
      setError(msg);
      pushToast({ type: "error", message: msg });
      return null;
    }
  }

  async function register(username: string, email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await registerApi(username, email, password);
      const token = (data as any).access_token ?? (data as any).token;
      if (token) {
        setAccessToken(token);
      }
      setUser(data.user);
      setLoading(false);
      pushToast({ type: "success", message: "Registration successful." });
      return data;
    } catch (err) {
      setLoading(false);
      const msg = extractErrorMessage(err, "Registration failed");
      setError(msg);
      pushToast({ type: "error", message: msg });
      return null;
    }
  }

  function logout() {
    clearAccessToken();
    setUser(null);
    pushToast({ type: "info", message: "Logged out." });
  }

  return { user, loading, error, login, register, logout };
}
