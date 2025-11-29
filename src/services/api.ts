// src/services/api.ts (or wherever you keep it)

import axios, {
  AxiosError,
 type  AxiosResponse,
 type InternalAxiosRequestConfig,
} from "axios";

// Navigation callback for unauthorized access
let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback;
};

// Main axios instance
const api = axios.create({
  baseURL: "/api", // should be proxied to http://localhost:8080/api in dev
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// A plain axios instance for refresh (NO interceptors)
const refreshClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public endpoints that don't require authentication
const publicEndpoints = ["/auth/", "/health", "/test", "/database/", "/admin/health"];

// -------------------- REQUEST INTERCEPTOR --------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};

    // For FormData, delete Content-Type so Axios can set it with boundary
    if (config.data instanceof FormData) {
      delete (config.headers as any)['Content-Type'];
    }

    const url = config.url ?? "";
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      url.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token"); // optional fallback

      if (token) {
        // Axios v1 uses AxiosHeaders sometimes -> cast
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------- REFRESH QUEUE SYSTEM --------------------
let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
};

// -------------------- RESPONSE INTERCEPTOR --------------------
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!error.response) return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ✅ refresh ONLY for 401 (Unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      // If refresh already happening, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers ?? {};
            (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // no refresh token -> logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (unauthorizedCallback) unauthorizedCallback();
        else window.location.href = "/login";

        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // IMPORTANT: refreshClient has NO interceptors/no old auth header
        const res = await refreshClient.post<{ accessToken: string }>(
          "/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (unauthorizedCallback) unauthorizedCallback();
        else window.location.href = "/login";

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ for 403 / others just reject (no refresh)
    return Promise.reject(error);
  }
);

// -------------------- OPTIONAL API HELPERS --------------------
export const apiService = {
  healthCheck: async () => (await api.get("/health")).data,
  test: async () => (await api.get("/test")).data,

  getData: async <T = unknown>(endpoint: string) =>
    (await api.get<T>(endpoint)).data,

  postData: async <T = unknown, D = unknown>(endpoint: string, data: D) =>
    (await api.post<T>(endpoint, data)).data,

  updateData: async <T = unknown, D = unknown>(endpoint: string, data: D) =>
    (await api.put<T>(endpoint, data)).data,

  deleteData: async <T = unknown>(endpoint: string) =>
    (await api.delete<T>(endpoint)).data,
};

export default api;
