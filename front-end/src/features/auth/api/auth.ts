import { api } from "../../../lib/axios";
import type { AuthResponse, ErrorResponse, User } from "../../../types/api";

// Wrap raw backend auth endpoints; adjust paths if different.
export async function loginApi(
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", {
    username,
    password,
  });
  // Normalize response to AuthResponse shape
  const d: any = data;
  return {
    access_token: d.access_token ?? d.token,
    refresh_token: d.refresh_token ?? null,
    user: d.user,
  } as AuthResponse;
}

export async function registerApi(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
  });
  const d: any = data;
  return {
    access_token: d.access_token ?? d.token,
    refresh_token: d.refresh_token ?? null,
    user: d.user,
  } as AuthResponse;
}

export async function refreshTokenApi(): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>("/auth/refresh");
  return data;
}

// Per backend API docs, current user endpoint is GET /api/me (not /api/auth/me)
export async function meApi(): Promise<User> {
  const { data } = await api.get<User>("/me");
  return data;
}

export function extractErrorMessage(err: any, fallback: string) {
  const resp: ErrorResponse | undefined = err?.response?.data;
  return resp?.message || fallback;
}
