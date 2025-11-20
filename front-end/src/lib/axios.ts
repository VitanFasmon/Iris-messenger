// Central Axios instance for Iris Messenger
// Auth header injection + 401 refresh retry logic
import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

declare module "axios" {
  interface AxiosRequestConfig {
    __isRetry?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // allow backend-issued cookies (e.g. refresh token) if present
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalConfig = error.config;
    // Only attempt refresh if we already had an auth header (i.e. a protected request),
    // avoid calling /auth/refresh after failed login attempts or anonymous 401s.
    const hadAuthHeader = !!originalConfig?.headers?.Authorization;
    if (
      status === 401 &&
      hadAuthHeader &&
      originalConfig &&
      !originalConfig.__isRetry
    ) {
      originalConfig.__isRetry = true;
      try {
        const refreshResp = await api.post("/auth/refresh");
        const newToken =
          (refreshResp.data as any)?.token ||
          (refreshResp.data as any)?.access_token;
        if (newToken && originalConfig) {
          setAccessToken(newToken);
          return api(originalConfig);
        }
      } catch (_) {
        clearAccessToken();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
