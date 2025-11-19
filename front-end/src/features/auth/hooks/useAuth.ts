import { useState } from "react";
import { api } from "../../../lib/axios";
import { setAccessToken, clearAccessToken } from "../../../lib/tokenStore";
import type { AuthResponse, ErrorResponse } from "../../../types/api";

export function useAuth() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>("/auth/login", {
        username,
        password,
      });
      setAccessToken(res.data.access_token);
      setUser(res.data.user);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(
        (err.response?.data as ErrorResponse)?.message || "Login failed"
      );
      return null;
    }
  }

  async function register(username: string, email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>("/auth/register", {
        username,
        email,
        password,
      });
      setAccessToken(res.data.access_token);
      setUser(res.data.user);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(
        (err.response?.data as ErrorResponse)?.message || "Registration failed"
      );
      return null;
    }
  }

  function logout() {
    clearAccessToken();
    setUser(null);
  }

  return { user, loading, error, login, register, logout };
}
