import { api } from "../../../lib/axios";
import type { AuthResponse, ErrorResponse, User } from "../../../types/api";

// Wrap raw backend auth endpoints; adjust paths if different.
export async function loginApi(
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    username,
    password,
  });
  return data;
}

export async function registerApi(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });
  return data;
}

export async function refreshTokenApi(): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>("/auth/refresh");
  return data;
}

export async function meApi(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export function extractErrorMessage(err: any, fallback: string) {
  const resp: ErrorResponse | undefined = err?.response?.data;
  return resp?.message || fallback;
}
