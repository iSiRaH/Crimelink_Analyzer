import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// Navigation callback for unauthorized access
let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback;
};

// Main axios instance
const api = axios.create({
  baseURL: "/api", // proxied to http://localhost:8080/api in development
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
const publicEndpoints = ['/auth/', '/health', '/test', '/database/'];

// Request interceptor: attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Add auth token if available and not a public endpoint
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh queue system
let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only refresh if 401 AND we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue while refresh running
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
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

        return Promise.reject(error);
      }

      try {
        // IMPORTANT: use refreshClient (no old auth header)
        const res = await refreshClient.post<{ accessToken: string }>(
          "/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
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

    return Promise.reject(error);
  }
);

// Optional API helper methods
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

