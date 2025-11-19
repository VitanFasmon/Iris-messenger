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
    if (status === 401 && originalConfig && !originalConfig.__isRetry) {
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
