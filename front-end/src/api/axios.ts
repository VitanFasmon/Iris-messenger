// Axios instance for Iris Messenger API
// Handles JWT, error normalization, and retry logic

import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Extend window for global token storage
declare global {
  interface Window {
    __iris_access_token?: string;
  }
}
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for JWT
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = window.__iris_access_token;
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor for error normalization
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // TODO: Retry on 401 with refresh token
    // TODO: Normalize error response
    return Promise.reject(error);
  }
);

export default api;
